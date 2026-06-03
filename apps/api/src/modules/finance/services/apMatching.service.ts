import { PurchaseOrder } from "../../procurement/models/purchaseOrder.model";
import { GoodsReceipt } from "../../inventory/models/goodsReceipt.model";

export const performThreeWayMatch =
  async (
    purchaseOrderId: string,
    goodsReceiptId: string,
    invoiceAmount: number
  ) => {

    const po =
      await PurchaseOrder.findById(
        purchaseOrderId
      );

    const gr =
      await GoodsReceipt.findById(
        goodsReceiptId
      );

    if (!po || !gr) {
      return false;
    }

    const expectedAmount =
      po.quantity * 1; // temporary

    return (
      expectedAmount ===
      invoiceAmount
    );
  };