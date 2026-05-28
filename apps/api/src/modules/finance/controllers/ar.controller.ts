import { Request, Response } from "express";

import { ARInvoice } from "../models/arInvoice.model";

import { createLedgerEntry } from "../services/ledger.service";
import { generateInvoicePDF } from "../services/pdf.service";
export const createARInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const invoice = await ARInvoice.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    await createLedgerEntry({
      tenantId: user.tenantId,
      referenceType: "INVOICE",
      referenceId: invoice._id,
      description: "Customer invoice created",
      debit: 0,
      credit: invoice.invoiceAmount,
    });

    res.status(201).json({
      message: "AR Invoice created",
      invoice,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const receivePayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { invoiceId } = req.body;

    const invoice =
      await ARInvoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    invoice.status = "PAID";

    await invoice.save();

    res.json({
      message: "Payment received",
      invoice,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const downloadInvoicePDF =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const invoice =
        await ARInvoice.findById(
          req.params.id
        );

      if (!invoice) {
        return res.status(404).json({
          message: "Invoice not found",
        });
      }

      generateInvoicePDF(invoice, res);

    } catch (error: any) {
      res.status(500).json({
        message: error.message,
      });
    }
  };