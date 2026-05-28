import { Schema, model } from "mongoose";

const journalLineSchema =
  new Schema({
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    debit: {
      type: Number,
      default: 0,
    },

    credit: {
      type: Number,
      default: 0,
    },
  });

const journalEntrySchema =
  new Schema(
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: "Tenant",
        required: true,
      },

      description: {
        type: String,
        required: true,
      },

      lines: [
        journalLineSchema,
      ],
    },
    {
      timestamps: true,
    }
  );

export const JournalEntry =
  model(
    "JournalEntry",
    journalEntrySchema
  );