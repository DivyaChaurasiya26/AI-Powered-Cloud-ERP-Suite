import { Request, Response } from "express";

import { VendorInvoice } from "../models/vendorInvoice.model";
import { VendorPayment } from "../models/vendorPayment.model";
import { submitForApproval } from "../../approvals/services/approval.service";

export const getVendorPayments = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const payments = await VendorPayment.find({ tenantId: user.tenantId }).sort({ createdAt: -1 });
    res.json({ payments });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

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

    const { autoApproved, request, result } = await submitForApproval({
      entityType: "VENDOR_PAYMENT",
      entityId: invoice._id,
      tenantId: user.tenantId,
      requestedBy: user.id,
      amount: invoice.invoiceAmount as unknown as number,
      payload: { paymentMethod },
    });

    res.status(autoApproved ? 201 : 202).json({
      message: autoApproved
        ? "Invoice paid successfully"
        : "Payment risk-flagged — pending approval",
      payment: result,
      approvalRequest: request,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};