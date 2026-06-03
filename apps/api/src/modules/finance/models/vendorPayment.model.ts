import { Schema, model } from "mongoose";

const vendorPaymentSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "VendorInvoice",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
    },

    paymentMethod: {
      type: String,
      enum: ["BANK_TRANSFER", "UPI", "CHEQUE"],
      default: "BANK_TRANSFER",
    },
  },
  {
    timestamps: true,
  }
);

export const VendorPayment = model(
  "VendorPayment",
  vendorPaymentSchema
);