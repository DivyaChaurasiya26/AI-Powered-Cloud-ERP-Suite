import { Schema, model } from "mongoose";

const ledgerSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    referenceType: {
      type: String,
      enum: ["PAYROLL", "INVOICE", "PURCHASE", "MANUAL"],
      required: true,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    description: {
      type: String,
      required: true,
    },

    debit: {
      type: Number,
      default: 0,
    },

    credit: {
      type: Number,
      default: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Ledger = model("Ledger", ledgerSchema);