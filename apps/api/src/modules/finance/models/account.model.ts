import { Schema, model } from "mongoose";

const accountSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    accountCode: {
      type: String,
      required: true,
      unique: true,
    },

    accountName: {
      type: String,
      required: true,
    },

    accountType: {
      type: String,
      enum: [
        "ASSET",
        "LIABILITY",
        "EQUITY",
        "REVENUE",
        "EXPENSE",
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Account = model(
  "Account",
  accountSchema
);