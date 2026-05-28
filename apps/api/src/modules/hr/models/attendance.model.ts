import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    clockIn: {
      type: Date,
      required: true,
    },

    clockOut: {
      type: Date,
    },

    totalHours: {
      type: Number,
      default: 0,
    },

    overtimeHours: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Attendance = model(
  "Attendance",
  attendanceSchema
);