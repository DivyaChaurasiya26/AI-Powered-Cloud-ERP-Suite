import { Schema, model } from "mongoose";

const exchangeRateSchema =
  new Schema(
    {
      baseCurrency: {
        type: String,
        required: true,
      },

      targetCurrency: {
        type: String,
        required: true,
      },

      rate: {
        type: Number,
        required: true,
      },

      date: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

export const ExchangeRate =
  model(
    "ExchangeRate",
    exchangeRateSchema
  );