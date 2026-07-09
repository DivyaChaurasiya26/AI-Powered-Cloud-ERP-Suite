import { Schema, model } from "mongoose";

const approvalRequestSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    entityType: {
      type: String,
      enum: ["VENDOR_PAYMENT"],
      required: true,
    },

    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    riskScore: {
      type: Number,
      required: true,
    },

    riskFactors: {
      type: [String],
      default: [],
    },

    payload: {
      type: Schema.Types.Mixed,
      default: {},
    },

    decision: {
      type: String,
      enum: ["PENDING", "AUTO_APPROVED", "APPROVED", "REJECTED"],
      default: "PENDING",
    },

    decidedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

approvalRequestSchema.index({ tenantId: 1, decision: 1, createdAt: -1 });

export const ApprovalRequest = model("ApprovalRequest", approvalRequestSchema);
