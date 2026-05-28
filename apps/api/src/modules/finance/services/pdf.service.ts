import PDFDocument from "pdfkit";

export const generateInvoicePDF = (
  invoice: any,
  res: any
) => {
  const doc = new PDFDocument();

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `inline; filename=invoice-${invoice.invoiceNumber}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(22).text(
    "ERP Invoice",
    {
      align: "center",
    }
  );

  doc.moveDown();

  doc.fontSize(14).text(
    `Customer: ${invoice.customerName}`
  );

  doc.text(
    `Invoice Number: ${invoice.invoiceNumber}`
  );

  doc.text(
    `Amount: ₹${invoice.invoiceAmount}`
  );

  doc.text(
    `Status: ${invoice.status}`
  );

  doc.text(
    `Due Date: ${invoice.dueDate}`
  );

  doc.end();
};