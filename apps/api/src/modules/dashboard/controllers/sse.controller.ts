import { Request, Response } from "express";

import {
  addClient,
  removeClient,
  broadcastKPIUpdate,
} from "../services/sse.service";

import {
  getRevenueKPIs,
  getExpenseKPIs,
  getInventoryKPIs,
  getPayrollKPIs,
} from "../services/kpi.service";

export const streamDashboard = async (
  req: Request,
  res: Response
) => {
  const user = (req as any).user;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  addClient(user.tenantId, res);

  const sendSnapshot = async () => {
    try {
      const [revenue, expenses, inventory, payroll] =
        await Promise.all([
          getRevenueKPIs(user.tenantId),
          getExpenseKPIs(user.tenantId),
          getInventoryKPIs(user.tenantId),
          getPayrollKPIs(user.tenantId),
        ]);

      broadcastKPIUpdate(user.tenantId, {
        revenue,
        expenses,
        inventory,
        payroll,
      });
    } catch {
      // client disconnected
    }
  };

  await sendSnapshot();

  const interval = setInterval(sendSnapshot, 30_000);

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15_000);

  req.on("close", () => {
    clearInterval(interval);
    clearInterval(heartbeat);
    removeClient(user.tenantId, res);
  });
};