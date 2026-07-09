import { Request, Response } from "express";



import { PurchaseOrder } from "../models/purchaseOrder.model";

import { Inventory } from "../models/inventory.model";
import { GoodsReceipt } from "../models/goodsReceipt.model";
import { reorderQueue } from "../queues/reorder.queue";
import { detectInventoryMovementAnomaly } from "../../anomaly/services/anomalyDetection.service";

export const getGoodsReceipts = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const receipts = await GoodsReceipt.find({ tenantId: user.tenantId }).sort({ createdAt: -1 });
    res.json({ receipts });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const receiveGoods = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const {
      purchaseOrderId,
      receivedItems,
    } = req.body;

    // create GRN
    const grn = await GoodsReceipt.create({
      purchaseOrderId,
      receivedItems,
      tenantId: user.tenantId,
    });

    // update inventory stock
    for (const item of receivedItems) {
     const updatedInventory =
  await Inventory.findByIdAndUpdate(
    item.inventoryItemId,
    {
      $inc: {
        quantity: item.quantityReceived,
      },
    },
    { new: true }
  );

if (
  updatedInventory &&
  updatedInventory.quantity <=
    updatedInventory.reorderLevel
) {
  await reorderQueue.add(
    "lowStockAlert",
    {
      itemName: updatedInventory.itemName,
      currentStock:
        updatedInventory.quantity,
    }
  );
}

await detectInventoryMovementAnomaly(
  user.tenantId,
  grn._id,
  item.inventoryItemId,
  item.quantityReceived
);
    }

    // update PO status
    await PurchaseOrder.findByIdAndUpdate(
      purchaseOrderId,
      {
        status: "RECEIVED",
      }
    );

    res.status(201).json({
      message: "Goods received successfully",
      grn,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};