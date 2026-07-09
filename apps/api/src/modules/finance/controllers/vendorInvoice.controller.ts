import { Request, Response } from "express";

import { VendorInvoice } from "../models/vendorInvoice.model";

import { performThreeWayMatch } from "../services/apMatching.service";

export const getVendorInvoices = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;

    const filter: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) filter.status = status;

    const invoices = await VendorInvoice.find(filter).sort({ createdAt: -1 });
    res.json({ invoices });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createVendorInvoice =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const user = (req as any).user;

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
          tenantId: user.tenantId,
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