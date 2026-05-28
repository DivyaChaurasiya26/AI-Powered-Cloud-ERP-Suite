import { Inventory } from "../models/inventory.model";

import { PurchaseOrder } from "../../procurement/models/purchaseOrder.model";

import { Vendor } from "../../procurement/vendor.model";

import { emailQueue } from "../../notifications/queues/email.queue";

export const checkAndReorder = async (
  inventoryItemId: string
) => {
  const item =
    await Inventory.findById(
      inventoryItemId
    );

  if (!item) return;

  if (
    item.quantity <
    item.reorderLevel
  ) {
    // prevent duplicate PO
    const existing =
      await PurchaseOrder.findOne({
        inventoryItemId,
        status: "DRAFT",
      });

    if (existing) return;

    const po =
      await PurchaseOrder.create({
        tenantId: item.tenantId,
        inventoryItemId:
          item._id,
        vendorId:
          item.preferredVendorId,
        quantity:
          item.reorderLevel * 2,
        status: "DRAFT",
      });

    // 🔥 EMAIL TRIGGER PART
    const vendor =
      await Vendor.findById(
        item.preferredVendorId
      );

    if (vendor?.email) {
      await emailQueue.add(
        "send-po-email",
        {
          to: vendor.email,
          subject:
            "Purchase Order Created",
          text: `PO created for item ${item.itemName} with quantity ${item.reorderLevel * 2}`,
        }
      );
    }

    return po;
  }
};