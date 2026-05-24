import { Schema, model } from "mongoose";

const tenantSchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
    },
  },
  {
    timestamps: true,
  }
);

export const Tenant = model("Tenant", tenantSchema);