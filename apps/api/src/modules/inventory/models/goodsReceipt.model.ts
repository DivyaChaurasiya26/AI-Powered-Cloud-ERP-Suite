import { Schema, model } from "mongoose";

const goodsReceiptSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    purchaseOrderId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },

    receivedItems: [
      {
        inventoryItemId: {
          type: Schema.Types.ObjectId,
          ref: "Inventory",
        },

        quantityReceived: Number,
      },
    ],

    receivedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const GoodsReceipt = model(
  "GoodsReceipt",
  goodsReceiptSchema
);