import { Request, Response } from "express";
import { Vendor } from "../vendor.model";

export const createVendor = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const vendor = await Vendor.create({
      ...req.body,
      tenantId: user.tenantId,
    });

    res.status(201).json({
      message: "Vendor created",
      vendor,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getVendors = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const vendors = await Vendor.find({
      tenantId: user.tenantId,
    });

    res.json(vendors);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};