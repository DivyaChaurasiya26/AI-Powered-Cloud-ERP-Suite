import { Schema, model } from "mongoose";

const leaveSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: String,
      enum: [
        "SICK",
        "CASUAL",
        "PAID",
      ],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },
  },
  {
    timestamps: true,
  }
);

export const Leave = model(
  "Leave",
  leaveSchema
);