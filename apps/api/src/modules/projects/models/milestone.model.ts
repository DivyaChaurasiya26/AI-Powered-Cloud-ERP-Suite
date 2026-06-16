import mongoose, { Schema, model } from "mongoose";

const milestoneSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "ACHIEVED",
        "MISSED",
      ],
      default: "PENDING",
    },
  },
  {
    timestamps: true,
  }
);

export const Milestone =
  mongoose.models.Milestone ||
  model("Milestone", milestoneSchema);
milestoneSchema.index({ tenantId: 1, projectId: 1 });