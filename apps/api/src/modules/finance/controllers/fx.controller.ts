import { Request, Response } from "express";

import { convertCurrency } from "../services/fx.service";

export const convertFX = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      amount,
      fromCurrency,
      toCurrency,
    } = req.body;

    const converted =
      await convertCurrency(
        amount,
        fromCurrency,
        toCurrency
      );

    res.json({
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount:
        converted,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};