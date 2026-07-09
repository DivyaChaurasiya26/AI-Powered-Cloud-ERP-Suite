import { Request, Response } from "express";

import { ApprovalRequest } from "../models/approvalRequest.model";
import { submitForApproval, decide } from "../services/approval.service";

export const createApprovalRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { entityType, entityId, amount, payload } = req.body;

    const { request, autoApproved, result } = await submitForApproval({
      entityType,
      entityId,
      tenantId: user.tenantId,
      requestedBy: user.id,
      amount,
      payload,
    });

    res.status(autoApproved ? 201 : 202).json({
      message: autoApproved ? "Auto-approved" : "Pending approval",
      request,
      result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listApprovalRequests = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { decision } = req.query;

    const filter: Record<string, unknown> = { tenantId: user.tenantId };
    if (decision) filter.decision = decision;

    const requests = await ApprovalRequest.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ requests });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovalRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const request = await ApprovalRequest.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });

    if (!request) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    res.status(200).json({ request });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const decideApprovalRequest = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { decision } = req.body;

    const existing = await ApprovalRequest.findOne({
      _id: req.params.id,
      tenantId: user.tenantId,
    });
    if (!existing) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    const { request, result } = await decide(req.params.id, decision, user.id);
    res.status(200).json({ message: `Request ${decision.toLowerCase()}`, request, result });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
