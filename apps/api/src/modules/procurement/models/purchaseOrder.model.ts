import mongoose, {
  Schema,
  model,
} from "mongoose";

const purchaseOrderSchema =
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

      vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
      },

      quantity: {
        type: Number,
        required: true,
      },

      status: {
        type: String,
        enum: [
          "DRAFT",
          "APPROVED",
          "RECEIVED",
        ],
        default: "DRAFT",
      },
    },
    {
      timestamps: true,
    }
  );

export const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  model(
    "PurchaseOrder",
    purchaseOrderSchema
  );