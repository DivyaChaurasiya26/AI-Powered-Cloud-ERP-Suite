import { z } from "zod";

const objectId = z
  .string()
  .length(24, "Must be a valid 24-character ObjectId");

export const createAPInvoiceSchema = z.object({
  vendorName: z
    .string({ required_error: "Vendor name is required" })
    .min(1, "Vendor name is required"),

  purchaseOrderId: objectId.optional(),

  invoiceNumber: z
    .string({ required_error: "Invoice number is required" })
    .min(1, "Invoice number is required"),

  invoiceAmount: z
    .number({ required_error: "Invoice amount is required" })
    .positive("Invoice amount must be positive"),

  dueDate: z
    .string({ required_error: "Due date is required" })
    .datetime({ offset: true })
    .or(z.string().min(1, "Due date is required")),
});

export const createARInvoiceSchema = z.object({
  customerName: z
    .string({ required_error: "Customer name is required" })
    .min(1, "Customer name is required"),

  invoiceNumber: z
    .string({ required_error: "Invoice number is required" })
    .min(1, "Invoice number is required"),

  invoiceAmount: z
    .number({ required_error: "Invoice amount is required" })
    .positive("Invoice amount must be positive"),

  dueDate: z
    .string({ required_error: "Due date is required" })
    .min(1, "Due date is required"),
});

export const payInvoiceSchema = z.object({
  invoiceId: objectId,
});

export const receivePaymentSchema = z.object({
  invoiceId: objectId,
});