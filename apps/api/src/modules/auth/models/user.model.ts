import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
   tenantId: {
  type: Schema.Types.ObjectId,
  ref: "Tenant",
  required: true ,
},

    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "HR", "EMPLOYEE"],
      default: "EMPLOYEE",
    },
  },
  {
    timestamps: true,
  }
);

export const User = model("User", userSchema);