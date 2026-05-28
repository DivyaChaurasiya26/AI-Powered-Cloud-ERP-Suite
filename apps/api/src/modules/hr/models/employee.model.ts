import { Schema, model } from "mongoose";

const employeeSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    employeeId: {
  type: String,
  required: true,
  unique: true,
},

    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
    },

    designation: {
      type: String,
    },

    salary: {
      type: Number,
      default: 0,
    },

    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Employee = model(
  "Employee",
  employeeSchema
);