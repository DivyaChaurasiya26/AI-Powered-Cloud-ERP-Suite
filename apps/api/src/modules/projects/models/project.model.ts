import mongoose, { Schema, model } from "mongoose";

const projectSchema = new Schema(
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

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "PLANNING",
        "ACTIVE",
        "ON_HOLD",
        "COMPLETED",
      ],
      default: "PLANNING",
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    plannedBudget: {
      type: Number,
      default: 0,
    },

    actualBudget: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Project = mongoose.models.Project || model("Project", projectSchema);
projectSchema.index({ tenantId: 1, status: 1 });