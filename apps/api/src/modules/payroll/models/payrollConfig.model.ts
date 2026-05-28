import { Schema, model } from "mongoose";

const payrollConfigSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    taxPercentage: {
      type: Number,
      default: 10,
    },

    pfPercentage: {
      type: Number,
      default: 12,
    },

    bonusPercentage: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const PayrollConfig = model(
  "PayrollConfig",
  payrollConfigSchema
);