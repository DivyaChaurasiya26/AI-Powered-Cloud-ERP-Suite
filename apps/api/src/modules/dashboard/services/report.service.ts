import PDFDocument from "pdfkit";
import {
  getRevenueKPIs,
  getExpenseKPIs,
  getInventoryKPIs,
  getPayrollKPIs,
  getRevenueMonthlySeries,
  getExpenseMonthlySeries,
  getLedgerMonthlySeries,
} from "./kpi.service";

const gatherReportData = async (
  tenantId: string,
  reportType: string,
  filters: any = {}
) => {
  switch (reportType) {
    case "revenue_summary":
      return {
        title: "Revenue Summary",
        kpis: await getRevenueKPIs(tenantId, filters),
        series: await getRevenueMonthlySeries(tenantId, filters),
      };
    case "expense_summary":
      return {
        title: "Expense Summary",
        kpis: await getExpenseKPIs(tenantId, filters),
        series: await getExpenseMonthlySeries(tenantId, filters),
      };
    case "inventory_status":
      return {
        title: "Inventory Status",
        kpis: await getInventoryKPIs(tenantId, filters),
        series: [],
      };
    case "payroll_summary":
      return {
        title: "Payroll Summary",
        kpis: await getPayrollKPIs(tenantId, filters),
        series: [],
      };
    case "ledger_summary":
      return {
        title: "Ledger Summary",
        kpis: {},
        series: await getLedgerMonthlySeries(tenantId, filters),
      };
    default:
      return { title: "Report", kpis: {}, series: [] };
  }
};

export const generateReportPDF = async (
  tenantId: string,
  reportType: string,
  filters: any = {}
): Promise<Buffer> => {
  const reportData = await gatherReportData(
    tenantId,
    reportType,
    filters
  );

  return new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    doc.fontSize(22).text(reportData.title, { align: "center" });
    doc.moveDown();

    doc.fontSize(11).text(
      `Generated: ${new Date().toLocaleString()}`,
      { align: "right" }
    );
    doc.moveDown();

    if (Object.keys(reportData.kpis).length > 0) {
      doc.fontSize(16).text("Key Metrics");
      doc.moveDown(0.5);

      Object.entries(reportData.kpis).forEach(([key, value]) => {
        const label = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (s) => s.toUpperCase());
        doc.fontSize(12).text(
          `${label}: ${
            typeof value === "number"
              ? `₹${Number(value).toLocaleString("en-IN")}`
              : String(value)
          }`
        );
      });
      doc.moveDown();
    }

    if (reportData.series.length > 0) {
      doc.fontSize(16).text("Monthly Breakdown");
      doc.moveDown(0.5);

      const headers = Object.keys(reportData.series[0]);
      doc.fontSize(11).text(headers.join("   |   "), { underline: true });
      doc.moveDown(0.3);

      reportData.series.forEach((row: any) => {
        const values = headers.map((h) =>
          typeof row[h] === "number"
            ? Number(row[h]).toLocaleString("en-IN")
            : String(row[h])
        );
        doc.fontSize(10).text(values.join("       "));
      });
    }

    doc.end();
  });
};

export const generateReportCSV = async (
  tenantId: string,
  reportType: string,
  filters: any = {}
): Promise<string> => {
  const reportData = await gatherReportData(
    tenantId,
    reportType,
    filters
  );

  const lines: string[] = [];

  lines.push(`"${reportData.title}"`);
  lines.push(`"Generated","${new Date().toISOString()}"`);
  lines.push("");

  if (Object.keys(reportData.kpis).length > 0) {
    lines.push('"Key Metrics"');
    lines.push('"Metric","Value"');
    Object.entries(reportData.kpis).forEach(([key, value]) => {
      lines.push(`"${key}","${value}"`);
    });
    lines.push("");
  }

  if (reportData.series.length > 0) {
    lines.push('"Monthly Breakdown"');
    const headers = Object.keys(reportData.series[0]);
    lines.push(headers.map((h) => `"${h}"`).join(","));
    reportData.series.forEach((row: any) => {
      lines.push(headers.map((h) => `"${row[h]}"`).join(","));
    });
  }

  return lines.join("\n");
};