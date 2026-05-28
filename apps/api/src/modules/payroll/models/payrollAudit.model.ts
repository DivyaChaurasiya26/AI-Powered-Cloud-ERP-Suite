import { Schema, model } from "mongoose";

const payrollAuditSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "UPDATED",
        "APPROVED",
        "PAID",
      ],
      required: true,
    },

    changedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    changes: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export const PayrollAudit = model(
  "PayrollAudit",
  payrollAuditSchema
);