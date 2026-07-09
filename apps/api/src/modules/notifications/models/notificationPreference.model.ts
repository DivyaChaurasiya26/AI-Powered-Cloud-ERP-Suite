import mongoose, { Schema, model } from "mongoose";

const channelPrefsSchema = new Schema(
  {
    email:   { type: Boolean, default: true },
    inApp:   { type: Boolean, default: true },
    webhook: { type: Boolean, default: false },
  },
  { _id: false }
);

const notificationPreferenceSchema = new Schema(
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

    PROJECT_OVERRUN: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    LEAVE_APPROVED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    PAYROLL_PROCESSED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    LOW_STOCK: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    FORECAST_GENERATED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    ANOMALY_DETECTED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    APPROVAL_REQUIRED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    APPROVAL_DECIDED: {
      type: channelPrefsSchema,
      default: () => ({}),
    },

    webhookUrl: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

notificationPreferenceSchema.index(
  { userId: 1 },
  { unique: true }
);

export const NotificationPreference =
  mongoose.models.NotificationPreference ||
  model(
    "NotificationPreference",
    notificationPreferenceSchema
  );