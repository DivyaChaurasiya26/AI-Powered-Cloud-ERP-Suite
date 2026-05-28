import { Schema, model } from "mongoose";

const inventoryBatchSchema =
  new Schema(
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: "Tenant",
        required: true,
      },

      inventoryItemId: {
        type: Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
      },

      quantity: {
        type: Number,
        required: true,
      },

      remainingQuantity: {
        type: Number,
        required: true,
      },

      unitCost: {
        type: Number,
        required: true,
      },

      receivedDate: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export const InventoryBatch =
  model(
    "InventoryBatch",
    inventoryBatchSchema
  );