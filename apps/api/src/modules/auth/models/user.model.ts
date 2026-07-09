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

    isErased: {
      type: Boolean,
      default: false,
    },

    erasedAt: {
      type: Date,
    },

    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    // Base32 TOTP secret. Never returned by any query that doesn't
    // explicitly .select("+mfaSecret") — excluded by default so it can't
    // leak through the same routes that already do `.select("-password")`.
    mfaSecret: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model("User", userSchema);