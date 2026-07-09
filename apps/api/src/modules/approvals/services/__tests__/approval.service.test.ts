import "../../../../test/setupTestDb";
import { createTenant, createUser, createVendor } from "../../../../test/helpers";
import { VendorInvoice } from "../../../finance/models/vendorInvoice.model";
import { VendorPayment } from "../../../finance/models/vendorPayment.model";
import { submitForApproval, decide } from "../approval.service";

const createMatchedInvoice = async (tenantId: any, vendorId: any, amount: number) =>
  VendorInvoice.create({
    tenantId,
    vendorId,
    purchaseOrderId: tenantId,
    goodsReceiptId: tenantId,
    invoiceNumber: `INV-${Math.random()}`,
    invoiceAmount: amount,
    status: "MATCHED",
  });

describe("approval.service", () => {
  it("auto-approves a low-value payment and pays the invoice immediately", async () => {
    const tenant = await createTenant("Auto Approve Co");
    const vendor = await createVendor(tenant._id, "Small Vendor");
    const admin = await createUser(tenant._id, "ADMIN");
    const invoice = await createMatchedInvoice(tenant._id, vendor._id, 2000);

    const { autoApproved, request, result } = await submitForApproval({
      entityType: "VENDOR_PAYMENT",
      entityId: invoice._id,
      tenantId: tenant._id,
      requestedBy: admin._id,
      amount: 2000,
      payload: { paymentMethod: "UPI" },
    });

    expect(autoApproved).toBe(true);
    expect(request.get("decision")).toBe("AUTO_APPROVED");
    expect(result).not.toBeNull();

    const updatedInvoice = await VendorInvoice.findById(invoice._id);
    expect(updatedInvoice!.get("status")).toBe("PAID");

    const payment = await VendorPayment.findOne({ invoiceId: invoice._id });
    expect(payment).not.toBeNull();
    expect(payment!.get("paymentMethod")).toBe("UPI");
  });

  it("holds a high-value payment for manual approval and applies it once approved", async () => {
    const tenant = await createTenant("Manual Approve Co");
    const vendor = await createVendor(tenant._id, "Big Vendor");
    const admin = await createUser(tenant._id, "ADMIN");
    const invoice = await createMatchedInvoice(tenant._id, vendor._id, 300000);

    const submitted = await submitForApproval({
      entityType: "VENDOR_PAYMENT",
      entityId: invoice._id,
      tenantId: tenant._id,
      requestedBy: admin._id,
      amount: 300000,
    });

    expect(submitted.autoApproved).toBe(false);
    expect(submitted.request.get("decision")).toBe("PENDING");
    expect(submitted.result).toBeNull();

    const invoiceStillMatched = await VendorInvoice.findById(invoice._id);
    expect(invoiceStillMatched!.get("status")).toBe("MATCHED");

    const { request: decided, result } = await decide(
      submitted.request._id,
      "APPROVED",
      admin._id
    );

    expect(decided.get("decision")).toBe("APPROVED");
    expect(result).not.toBeNull();

    const paidInvoice = await VendorInvoice.findById(invoice._id);
    expect(paidInvoice!.get("status")).toBe("PAID");
  });

  it("rejects a pending request without paying the invoice", async () => {
    const tenant = await createTenant("Reject Co");
    const vendor = await createVendor(tenant._id, "Rejected Vendor");
    const admin = await createUser(tenant._id, "ADMIN");
    const invoice = await createMatchedInvoice(tenant._id, vendor._id, 300000);

    const submitted = await submitForApproval({
      entityType: "VENDOR_PAYMENT",
      entityId: invoice._id,
      tenantId: tenant._id,
      requestedBy: admin._id,
      amount: 300000,
    });

    const { request: decided, result } = await decide(
      submitted.request._id,
      "REJECTED",
      admin._id
    );

    expect(decided.get("decision")).toBe("REJECTED");
    expect(result).toBeNull();

    const invoiceAfterReject = await VendorInvoice.findById(invoice._id);
    expect(invoiceAfterReject!.get("status")).toBe("MATCHED");

    const payment = await VendorPayment.findOne({ invoiceId: invoice._id });
    expect(payment).toBeNull();
  });

  it("cannot decide the same request twice", async () => {
    const tenant = await createTenant("Double Decide Co");
    const vendor = await createVendor(tenant._id, "Vendor");
    const admin = await createUser(tenant._id, "ADMIN");
    const invoice = await createMatchedInvoice(tenant._id, vendor._id, 300000);

    const submitted = await submitForApproval({
      entityType: "VENDOR_PAYMENT",
      entityId: invoice._id,
      tenantId: tenant._id,
      requestedBy: admin._id,
      amount: 300000,
    });

    await decide(submitted.request._id, "APPROVED", admin._id);

    await expect(decide(submitted.request._id, "APPROVED", admin._id)).rejects.toThrow(
      "already been decided"
    );
  });
});
