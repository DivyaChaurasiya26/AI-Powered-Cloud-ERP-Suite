import { Schema, model } from "mongoose";

const inventorySchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    sku: {
      type: String,
      unique: true,
      required: true,
    },

    quantity: {
      type: Number,
      default: 0,
    },

    reorderLevel: {
      type: Number,
      default: 10,
    },

    warehouseLocation: {
      type: String,
      required: true,
    },

    unitPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Inventory = model(
  "Inventory",
  inventorySchema
);