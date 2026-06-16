import { ARInvoice } from "../../finance/models/arInvoice.model";
import { APInvoice } from "../../finance/models/apInvoice.model";
import { Ledger } from "../../finance/models/ledger.model";
import { Inventory } from "../../inventory/models/inventory.model";
import { Employee } from "../../hr/models/employee.model";
import { Payroll } from "../../payroll/models/payroll.model";
import { redis } from "../../../config/redis";

const KPI_TTL = 60; // seconds — KPI data acceptable to be 60s stale

// ── Cache helpers (same pattern as forecasting.service.ts) ───────────────────

const getKpiCache = async (key: string): Promise<any | null> => {
  const raw = await redis.get(key);
  return raw ? JSON.parse(raw) : null;
};

const setKpiCache = async (key: string, data: any): Promise<void> => {
  await redis.setex(key, KPI_TTL, JSON.stringify(data));
};

export const invalidateKpiCache = async (tenantId: string): Promise<void> => {
  // Called from AP/AR controllers on mutations that change KPI values
  await redis.del(`kpis:revenue:${tenantId}`);
  await redis.del(`kpis:expenses:${tenantId}`);
  await redis.del(`kpis:inventory:${tenantId}`);
  await redis.del(`kpis:payroll:${tenantId}`);
};

// ── Revenue KPIs — consolidated with $facet (was 3 separate aggregations) ────

export const getRevenueKPIs = async (
  tenantId: string,
  filters: any = {}
) => {
  const cacheKey = `kpis:revenue:${tenantId}`;
  const cached = await getKpiCache(cacheKey);
  if (cached) return cached;

  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate)   match.createdAt.$lte = new Date(filters.endDate);
  }

  // Single $facet pipeline replaces 3 separate aggregation calls
  const [result] = await ARInvoice.aggregate([
    { $match: match },
    {
      $facet: {
        total:   [{ $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
        paid:    [{ $match: { status: "PAID" } },    { $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
        pending: [{ $match: { status: "PENDING" } }, { $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
      },
    },
  ]);

  const data = {
    totalRevenue:   result?.total[0]?.v   || 0,
    paidRevenue:    result?.paid[0]?.v    || 0,
    pendingRevenue: result?.pending[0]?.v || 0,
  };

  await setKpiCache(cacheKey, data);
  return data;
};

// ── Expense KPIs — consolidated with $facet (was 3 separate aggregations) ────

export const getExpenseKPIs = async (
  tenantId: string,
  filters: any = {}
) => {
  const cacheKey = `kpis:expenses:${tenantId}`;
  const cached = await getKpiCache(cacheKey);
  if (cached) return cached;

  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate)   match.createdAt.$lte = new Date(filters.endDate);
  }

  const [result] = await APInvoice.aggregate([
    { $match: match },
    {
      $facet: {
        total:   [{ $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
        paid:    [{ $match: { status: "PAID" } },    { $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
        pending: [{ $match: { status: "PENDING" } }, { $group: { _id: null, v: { $sum: "$invoiceAmount" } } }],
      },
    },
  ]);

  const data = {
    totalExpenses:   result?.total[0]?.v   || 0,
    paidExpenses:    result?.paid[0]?.v    || 0,
    pendingExpenses: result?.pending[0]?.v || 0,
  };

  await setKpiCache(cacheKey, data);
  return data;
};

// ── Inventory KPIs — consolidated with $facet (was 2 countDocuments + aggregate)

export const getInventoryKPIs = async (
  tenantId: string,
  filters: any = {}
) => {
  const cacheKey = `kpis:inventory:${tenantId}`;
  const cached = await getKpiCache(cacheKey);
  if (cached) return cached;

  const match: any = { tenantId };

  const [result] = await Inventory.aggregate([
    { $match: match },
    {
      $facet: {
        total:     [{ $count: "n" }],
        lowStock:  [{ $match: { $expr: { $lte: ["$quantity", "$reorderLevel"] } } }, { $count: "n" }],
        value:     [{ $group: { _id: null, v: { $sum: { $multiply: ["$quantity", "$unitPrice"] } } } }],
      },
    },
  ]);

  const data = {
    totalItems:      result?.total[0]?.n    || 0,
    lowStockItems:   result?.lowStock[0]?.n || 0,
    inventoryValue:  result?.value[0]?.v    || 0,
  };

  await setKpiCache(cacheKey, data);
  return data;
};

// ── Payroll KPIs ──────────────────────────────────────────────────────────────

export const getPayrollKPIs = async (
  tenantId: string,
  filters: any = {}
) => {
  const cacheKey = `kpis:payroll:${tenantId}`;
  const cached = await getKpiCache(cacheKey);
  if (cached) return cached;

  const [headcount, payrollAgg] = await Promise.all([
    Employee.countDocuments({ tenantId }),
    Payroll.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          totalGross: { $sum: "$basicSalary" },
          totalNet:   { $sum: "$netSalary" },
        },
      },
    ]).catch(() => []),
  ]);

  const data = {
    headcount,
    totalGrossSalary: payrollAgg[0]?.totalGross || 0,
    totalNetSalary:   payrollAgg[0]?.totalNet   || 0,
  };

  await setKpiCache(cacheKey, data);
  return data;
};

// ── Ledger monthly series ─────────────────────────────────────────────────────

export const getLedgerMonthlySeries = async (
  tenantId: string,
  filters: any = {}
) => {
  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.date = {};
    if (filters.startDate) match.date.$gte = new Date(filters.startDate);
    if (filters.endDate)   match.date.$lte = new Date(filters.endDate);
  }

  const series = await Ledger.aggregate([
    { $match: match },
    {
      $group: {
        _id:          { year: { $year: "$date" }, month: { $month: "$date" } },
        totalDebit:   { $sum: "$debit" },
        totalCredit:  { $sum: "$credit" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return series.map((s: any) => ({
    period: `${s._id.year}-${String(s._id.month).padStart(2, "0")}`,
    debit:  s.totalDebit,
    credit: s.totalCredit,
    net:    s.totalCredit - s.totalDebit,
  }));
};

// ── Revenue monthly series ────────────────────────────────────────────────────

export const getRevenueMonthlySeries = async (
  tenantId: string,
  filters: any = {}
) => {
  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate)   match.createdAt.$lte = new Date(filters.endDate);
  }

  const series = await ARInvoice.aggregate([
    { $match: match },
    {
      $group: {
        _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$invoiceAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return series.map((s: any) => ({
    period: `${s._id.year}-${String(s._id.month).padStart(2, "0")}`,
    total:  s.total,
    count:  s.count,
  }));
};

// ── Expense monthly series ────────────────────────────────────────────────────

export const getExpenseMonthlySeries = async (
  tenantId: string,
  filters: any = {}
) => {
  const match: any = { tenantId };

  if (filters.startDate || filters.endDate) {
    match.createdAt = {};
    if (filters.startDate) match.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate)   match.createdAt.$lte = new Date(filters.endDate);
  }

  const series = await APInvoice.aggregate([
    { $match: match },
    {
      $group: {
        _id:   { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$invoiceAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return series.map((s: any) => ({
    period: `${s._id.year}-${String(s._id.month).padStart(2, "0")}`,
    total:  s.total,
    count:  s.count,
  }));
};