import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
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

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "HALF_DAY"],
      default: "PRESENT",
    },

    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
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