import { Request, Response } from "express";

import { AnomalyFlag } from "../models/anomalyFlag.model";
import { runTenantScan } from "../services/anomalyDetection.service";

export const listAnomalies = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status, severity } = req.query;

    const filter: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    const anomalies = await AnomalyFlag.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ anomalies });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnomaly = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const anomaly = await AnomalyFlag.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!anomaly) {
      return res.status(404).json({ message: "Anomaly flag not found" });
    }

    res.status(200).json({ anomaly });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAnomalyStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { status } = req.body;

    const anomaly = await AnomalyFlag.findOneAndUpdate(
      { _id: req.params.id, tenantId: user.tenantId },
      { status, reviewedBy: user.id },
      { new: true }
    );

    if (!anomaly) {
      return res.status(404).json({ message: "Anomaly flag not found" });
    }

    res.status(200).json({ message: "Anomaly updated", anomaly });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerScan = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const flags = await runTenantScan(user.tenantId);
    res.status(200).json({ message: "Scan complete", flagsCreated: flags.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
