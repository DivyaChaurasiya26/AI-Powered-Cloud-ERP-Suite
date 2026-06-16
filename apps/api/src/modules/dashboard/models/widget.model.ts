import { Schema, model } from "mongoose";

const widgetSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    dashboardId: {
      type: String,
      required: true,
      default: "main",
    },

    title: {
      type: String,
      required: true,
    },

    chartType: {
      type: String,
      enum: [
        "bar",
        "line",
        "pie",
        "heatmap",
        "funnel",
        "kpi",
      ],
      required: true,
    },

    dataSource: {
      type: String,
      enum: [
        "revenue",
        "expenses",
        "inventory",
        "payroll",
        "headcount",
        "ledger",
      ],
      required: true,
    },

    filters: {
      type: Object,
      default: {},
    },

    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      w: { type: Number, default: 4 },
      h: { type: Number, default: 3 },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Widget = model(
  "Widget",
  widgetSchema
);
widgetSchema.index({ tenantId: 1, dashboardId: 1, isActive: 1 });