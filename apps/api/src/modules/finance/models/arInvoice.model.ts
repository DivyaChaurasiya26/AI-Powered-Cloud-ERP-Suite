import { Schema, model } from "mongoose";

const arInvoiceSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    invoiceAmount: {
      type: Number,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export const ARInvoice = model(
  "ARInvoice",
  arInvoiceSchema
);
arInvoiceSchema.index({ tenantId: 1, status: 1, createdAt: -1 });