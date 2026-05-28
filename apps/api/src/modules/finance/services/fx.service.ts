import { ExchangeRate } from "../models/exchangeRate.model";

export const convertCurrency =
  async (
    amount: number,
    from: string,
    to: string
  ) => {
    if (from === to) {
      return amount;
    }

    const rate =
      await ExchangeRate.findOne({
        baseCurrency: from,
        targetCurrency: to,
      }).sort({
        createdAt: -1,
      });

    if (!rate) {
      throw new Error(
        "Exchange rate not found"
      );
    }

    return amount * rate.rate;
  };