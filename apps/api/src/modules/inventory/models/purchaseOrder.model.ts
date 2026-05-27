import { Schema, model } from "mongoose";

const purchaseOrderSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    vendorName: {
      type: String,
      required: true,
    },

    items: [
      {
        inventoryItemId: {
          type: Schema.Types.ObjectId,
          ref: "Inventory",
        },

        quantity: Number,

        unitPrice: Number,
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "RECEIVED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export const PurchaseOrder = model(
  "PurchaseOrder",
  purchaseOrderSchema
);