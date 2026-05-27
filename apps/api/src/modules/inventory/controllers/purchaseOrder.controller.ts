import { Request, Response } from "express";

import { PurchaseOrder } from "../models/purchaseOrder.model";

export const createPurchaseOrder = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const { vendorName, items } = req.body;

    // calculate total
    let totalAmount = 0;

    items.forEach((item: any) => {
      totalAmount +=
        item.quantity * item.unitPrice;
    });

    const po = await PurchaseOrder.create({
      vendorName,
      items,
      totalAmount,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Purchase Order created",
      po,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPurchaseOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const pos = await PurchaseOrder.find({
      tenantId: user.tenantId,
    });

    res.json(pos);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};