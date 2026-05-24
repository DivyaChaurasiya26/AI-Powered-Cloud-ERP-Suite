import { Request, Response } from "express";
import { Tenant } from "../models/tenant.model";

export const createTenant = async (req: Request, res: Response) => {
  try {
    const { companyName, email } = req.body;

    const tenant = await Tenant.create({
      companyName,
      email,
    });

    res.status(201).json({
      message: "Tenant created",
      tenant,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};