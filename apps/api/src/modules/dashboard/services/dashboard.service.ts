import { Widget } from "../models/widget.model";
import {
  getRevenueKPIs,
  getExpenseKPIs,
  getInventoryKPIs,
  getPayrollKPIs,
  getLedgerMonthlySeries,
  getRevenueMonthlySeries,
  getExpenseMonthlySeries,
} from "./kpi.service";

export const createWidget = async (
  tenantId: string,
  data: any
) => {
  return await Widget.create({
    ...data,
    tenantId,
  });
};

export const getWidgets = async (
  tenantId: string,
  dashboardId = "main"
) => {
  return await Widget.find({
    tenantId,
    dashboardId,
    isActive: true,
  }).sort({ "position.y": 1, "position.x": 1 });
};

export const updateWidget = async (
  tenantId: string,
  widgetId: string,
  data: any
) => {
  return await Widget.findOneAndUpdate(
    { _id: widgetId, tenantId },
    { $set: data },
    { new: true }
  );
};

export const deleteWidget = async (
  tenantId: string,
  widgetId: string
) => {
  return await Widget.findOneAndUpdate(
    { _id: widgetId, tenantId },
    { $set: { isActive: false } },
    { new: true }
  );
};

export const resolveWidgetData = async (
  tenantId: string,
  dataSource: string,
  filters: any = {}
) => {
  switch (dataSource) {
    case "revenue":
      return {
        kpis: await getRevenueKPIs(tenantId, filters),
        series: await getRevenueMonthlySeries(tenantId, filters),
      };
    case "expenses":
      return {
        kpis: await getExpenseKPIs(tenantId, filters),
        series: await getExpenseMonthlySeries(tenantId, filters),
      };
    case "inventory":
      return {
        kpis: await getInventoryKPIs(tenantId, filters),
      };
    case "payroll":
      return {
        kpis: await getPayrollKPIs(tenantId, filters),
      };
    case "ledger":
      return {
        series: await getLedgerMonthlySeries(tenantId, filters),
      };
    default:
      return {};
  }
};

export const getDashboardSnapshot = async (
  tenantId: string,
  dashboardId = "main"
) => {
  const widgets = await getWidgets(tenantId, dashboardId);

  const results = await Promise.all(
    widgets.map(async (w) => {
      const data = await resolveWidgetData(
        tenantId,
        w.dataSource,
        w.filters
      );
      return {
        widgetId: w._id,
        title: w.title,
        chartType: w.chartType,
        dataSource: w.dataSource,
        position: w.position,
        data,
      };
    })
  );

  return results;
};

export const getDrillDownData = async (
  tenantId: string,
  dataSource: string,
  filters: any = {}
) => {
  const { ARInvoice } = await import(
    "../../finance/models/arInvoice.model"
  );
  const { APInvoice } = await import(
    "../../finance/models/apInvoice.model"
  );
  const { Inventory } = await import(
    "../../inventory/models/inventory.model"
  );
  const { Ledger } = await import(
    "../../finance/models/ledger.model"
  );

  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) match.createdAt.$lte = new Date(filters.endDate);
  }

  if (filters.status) match.status = filters.status;

  switch (dataSource) {
    case "revenue":
      return await ARInvoice.find(match)
        .sort({ createdAt: -1 })
        .limit(100);
    case "expenses":
      return await APInvoice.find(match)
        .sort({ createdAt: -1 })
        .limit(100);
    case "inventory":
      return await Inventory.find({ tenantId })
        .sort({ quantity: 1 })
        .limit(100);
    case "ledger":
      return await Ledger.find(match)
        .sort({ date: -1 })
        .limit(100);
    default:
      return [];
  }
};