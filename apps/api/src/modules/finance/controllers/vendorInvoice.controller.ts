import { Request, Response } from "express";

import { VendorInvoice } from "../models/vendorInvoice.model";

import { performThreeWayMatch } from "../services/apMatching.service";

export const createVendorInvoice =
  async (
    req: Request,
    res: Response
  ) => {
    try {

      const {
        vendorId,
        purchaseOrderId,
        goodsReceiptId,
        invoiceNumber,
        invoiceAmount,
      } = req.body;

      const matched =
        await performThreeWayMatch(
          purchaseOrderId,
          goodsReceiptId,
          invoiceAmount
        );

      const invoice =
        await VendorInvoice.create({
          ...req.body,
          status:
            matched
              ? "MATCHED"
              : "REJECTED",
        });

      res.status(201).json({
        message:
          matched
            ? "Invoice matched"
            : "Invoice rejected",

        invoice,
      });

    } catch (error: any) {

      res.status(500).json({
        message:
          error.message,
      });
    }
  };