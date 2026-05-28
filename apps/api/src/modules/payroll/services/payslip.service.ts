import PDFDocument from "pdfkit";
import { createAutoJournalEntry } from "../../finance/services/autoLedger.service";
export const generatePayslip =
  async (payroll: any) => {
    return new Promise<Buffer>(
      (resolve) => {

        const doc =
          new PDFDocument();

        const buffers: any[] = [];

        doc.on(
          "data",
          buffers.push.bind(buffers)
        );

        doc.on("end", () => {
          const pdfData =
            Buffer.concat(buffers);

          resolve(pdfData);
        });

        // Title
        doc.fontSize(22).text(
          "Employee Payslip",
          {
            align: "center",
          }
        );

        doc.moveDown();

        // Employee Info
        doc.fontSize(14).text(
          `Employee: ${payroll.employeeName}`
        );

        doc.text(
          `Month: ${payroll.month}`
        );

        doc.moveDown();

        // Salary Breakdown
        doc.text(
          `Gross Salary: ₹${payroll.grossSalary}`
        );

        doc.text(
          `Tax: ₹${payroll.tax}`
        );

        doc.text(
          `PF Deduction: ₹${payroll.pf}`
        );

        doc.text(
          `Bonus: ₹${payroll.bonus}`
        );

        doc.moveDown();

        doc.fontSize(18).text(
          `Net Salary: ₹${payroll.netSalary}`,
          {
            underline: true,
          }
        );

        doc.end();
      }
    );
  };