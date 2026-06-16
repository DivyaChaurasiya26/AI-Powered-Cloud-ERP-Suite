import { Schema, model } from "mongoose";

const reportScheduleSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    reportType: {
      type: String,
      enum: [
        "revenue_summary",
        "expense_summary",
        "inventory_status",
        "payroll_summary",
        "ledger_summary",
      ],
      required: true,
    },

    format: {
      type: String,
      enum: ["pdf", "excel"],
      default: "pdf",
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },

    recipientEmail: {
      type: String,
      required: true,
    },

    filters: {
      type: Object,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastRunAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const ReportSchedule = model(
  "ReportSchedule",
  reportScheduleSchema
);