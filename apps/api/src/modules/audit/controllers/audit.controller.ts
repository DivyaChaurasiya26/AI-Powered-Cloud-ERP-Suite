import { Request, Response } from "express";
import { AuditLog } from "../models/auditLog.model";
import { verifyChain } from "../services/auditLog.service";
import { User } from "../../auth/models/user.model";

export const listAuditLogs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { entityType, action, page = "1", limit = "50" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { tenantId: user.tenantId };
    if (entityType) filter.entityType = entityType;
    if (action) filter.action = action;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ logs, total, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditChainStatus = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const result = await verifyChain(user.tenantId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── GDPR Art. 15/20: data subject export ────────────────────────────────────
export const exportMyData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const [profile, activity] = await Promise.all([
      User.findById(user.id).select("-password").lean(),
      AuditLog.find({ tenantId: user.tenantId, userId: user.id })
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean(),
    ]);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="data-export-${user.id}.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      profile,
      activityLog: activity,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── GDPR Art. 17: right to erasure ──────────────────────────────────────────
// Soft-delete: PII is scrubbed and the account is deactivated, but the row
// (and any audit trail referencing the user id) is kept for legal/financial
// record-keeping — matching the soft-delete pipeline already documented for
// this project rather than a hard row delete, which would break FK-style
// references (payroll, approvals, audit log) elsewhere in the schema.
export const eraseMyData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const anonymizedEmail = `erased-${user.id}@deleted.local`;
    const updated = await User.findByIdAndUpdate(
      user.id,
      {
        name: "Erased User",
        email: anonymizedEmail,
        isErased: true,
        erasedAt: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Personal data erased. Your account has been deactivated.",
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
