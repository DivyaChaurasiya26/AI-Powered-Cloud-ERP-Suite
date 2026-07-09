import { Schema, model } from "mongoose";

const anomalyFlagSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    sourceType: {
      type: String,
      enum: ["VENDOR_PAYMENT", "VENDOR_INVOICE", "INVENTORY_MOVEMENT"],
      required: true,
    },

    sourceId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    metricValue: {
      type: Number,
      required: true,
    },

    baseline: {
      mean: { type: Number, required: true },
      stdDev: { type: Number, required: true },
    },

    score: {
      type: Number,
      required: true,
    },

    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true,
    },

    status: {
      type: String,
      enum: ["OPEN", "REVIEWED", "DISMISSED"],
      default: "OPEN",
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

anomalyFlagSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
anomalyFlagSchema.index({ sourceType: 1, sourceId: 1 });

export const AnomalyFlag = model("AnomalyFlag", anomalyFlagSchema);
