import { Request, Response } from "express";

import {
  getRevenueKPIs,
  getExpenseKPIs,
  getInventoryKPIs,
  getPayrollKPIs,
  getLedgerMonthlySeries,
  getRevenueMonthlySeries,
  getExpenseMonthlySeries,
} from "../services/kpi.service";

import {
  getDashboardSnapshot,
  getDrillDownData,
} from "../services/dashboard.service";

export const getKPIs = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const filters = req.query;

    const [revenue, expenses, inventory, payroll] =
      await Promise.all([
        getRevenueKPIs(user.tenantId, filters),
        getExpenseKPIs(user.tenantId, filters),
        getInventoryKPIs(user.tenantId, filters),
        getPayrollKPIs(user.tenantId, filters),
      ]);

    res.json({ revenue, expenses, inventory, payroll });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSnapshot = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const dashboardId =
      (req.query.dashboardId as string) || "main";

    const snapshot = await getDashboardSnapshot(
      user.tenantId,
      dashboardId
    );

    res.json({ widgets: snapshot });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { dataSource } = req.params;
    const filters = req.query;

    let data: any = {};

    switch (dataSource) {
      case "revenue":
        data = await getRevenueMonthlySeries(user.tenantId, filters);
        break;
      case "expenses":
        data = await getExpenseMonthlySeries(user.tenantId, filters);
        break;
      case "ledger":
        data = await getLedgerMonthlySeries(user.tenantId, filters);
        break;
      default:
        return res.status(400).json({
          message: `Unknown dataSource: ${dataSource}`,
        });
    }

    res.json({ dataSource, series: data });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const drillDown = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user;
    const { dataSource, filters } = req.body;

    if (!dataSource) {
      return res.status(400).json({
        message: "dataSource is required",
      });
    }

    const rows = await getDrillDownData(
      user.tenantId,
      dataSource,
      filters || {}
    );

    res.json({ dataSource, rows, count: rows.length });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};