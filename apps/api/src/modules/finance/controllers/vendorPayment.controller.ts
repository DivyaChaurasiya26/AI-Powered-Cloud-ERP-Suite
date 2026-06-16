import { Request, Response } from "express";

import { VendorInvoice } from "../models/vendorInvoice.model";
import { VendorPayment } from "../models/vendorPayment.model";
import { createAutoJournalEntry } from "../services/autoLedger.service";

export const payVendorInvoice = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { invoiceId, paymentMethod } = req.body;

    const invoice = await VendorInvoice.findOne({
      _id: invoiceId,
      tenantId: user.tenantId,
    });

    if (!invoice) {
      return res.status(404).json({
        message: "Invoice not found",
      });
    }

    if (invoice.status !== "MATCHED") {
      return res.status(400).json({
        message: "Only MATCHED invoices can be paid",
      });
    }

    const payment = await VendorPayment.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      amount: invoice.invoiceAmount,
      paymentMethod,
    });

    invoice.status = "PAID";
    await invoice.save();

    res.status(201).json({
      message: "Invoice paid successfully",
      payment,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};