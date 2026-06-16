import mongoose, { Schema, model } from "mongoose";

const taskSchema = new Schema(
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

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "TODO",
        "IN_PROGRESS",
        "DONE",
        "BLOCKED",
      ],
      default: "TODO",
    },

    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    dependsOn: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    plannedHours: {
      type: Number,
      default: 0,
    },

    actualHours: {
      type: Number,
      default: 0,
    },

    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const Task =
  mongoose.models.Task ||
  model("Task", taskSchema);

taskSchema.index({ tenantId: 1, projectId: 1 });
taskSchema.index({ tenantId: 1, assigneeId: 1 });