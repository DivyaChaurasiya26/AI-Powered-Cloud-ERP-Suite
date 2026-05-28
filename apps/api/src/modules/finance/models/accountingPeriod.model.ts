import { Schema, model } from "mongoose";

const accountingPeriodSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    closedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const AccountingPeriod = model(
  "AccountingPeriod",
  accountingPeriodSchema
);