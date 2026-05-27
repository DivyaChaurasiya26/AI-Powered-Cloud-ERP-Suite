import { Request, Response } from "express";

import { Inventory } from "../models/inventory.model";

export const createInventoryItem = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const inventoryItem =
      await Inventory.create({
        ...req.body,
        tenantId: user.tenantId,
      });

    res.status(201).json({
      message: "Inventory item created",
      inventoryItem,
    });

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getInventoryItems = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;

    const items = await Inventory.find({
      tenantId: user.tenantId,
    });

    res.json(items);

  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};