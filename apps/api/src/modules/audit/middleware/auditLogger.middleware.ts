import { Request, Response, NextFunction } from "express";
import { recordAuditEntry } from "../services/auditLog.service";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Skip auth endpoints — logging a login/register attempt (even redacted)
// belongs in a security log, not the tenant business-data audit trail.
const SKIP_PREFIXES = ["/api/auth"];

// Registered once, early in the middleware chain. Reads req.user at
// response-finish time, by which point the route's own authMiddleware
// (if any) has already run and populated it.
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  if (!MUTATING_METHODS.has(req.method) || SKIP_PREFIXES.some((p) => req.path.startsWith(p))) {
    return next();
  }

  res.on("finish", () => {
    const user = (req as any).user;
    if (!user?.tenantId) return;

    recordAuditEntry({
      tenantId: user.tenantId,
      userId: user.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      ip: req.ip,
      body: req.body,
    }).catch((err) => {
      console.error("Audit log write failed", err);
    });
  });

  next();
};
