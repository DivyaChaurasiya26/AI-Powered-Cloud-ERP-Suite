import mongoose, { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        "PROJECT_OVERRUN",
        "LEAVE_APPROVED",
        "PAYROLL_PROCESSED",
        "LOW_STOCK",
        "FORECAST_GENERATED",
        "ANOMALY_DETECTED",
        "APPROVAL_REQUIRED",
        "APPROVAL_DECIDED",
      ],
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    channel: {
      type: String,
      enum: ["inApp", "email", "webhook"],
      default: "inApp",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const Notification =
  mongoose.models.Notification ||
  model("Notification", notificationSchema);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });