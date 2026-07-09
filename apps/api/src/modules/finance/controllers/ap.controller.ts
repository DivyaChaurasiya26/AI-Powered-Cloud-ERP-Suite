import { Request, Response } from "express";

import { createLedgerEntry } from "../services/ledger.service";
import { APInvoice } from "../models/apInvoice.model";

export const createAPInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const invoice = await APInvoice.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    await createLedgerEntry({
      tenantId: user.tenantId,
      referenceType: "PURCHASE",
      referenceId: invoice._id,
      description: "Vendor invoice created",
      debit: invoice.invoiceAmount,
      credit: 0,
    });

    res.status(201).json({
      message: "AP Invoice created",
      invoice,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAPInvoices = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { status } = req.query;

    const filter: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) filter.status = status;

    const invoices = await APInvoice.find(filter).sort({ createdAt: -1 });
    res.json({ invoices });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const payInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { invoiceId } = req.body;

    const invoice = await APInvoice.findOne({
      _id: invoiceId,
      tenantId: user.tenantId,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    invoice.status = "PAID";
    await invoice.save();

    res.json({
      message: "Invoice paid successfully",
      invoice,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};