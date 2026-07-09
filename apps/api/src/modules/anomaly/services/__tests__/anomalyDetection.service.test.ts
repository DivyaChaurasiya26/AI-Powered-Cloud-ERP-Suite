import "../../../../test/setupTestDb";
import { createTenant, createVendor } from "../../../../test/helpers";
import { VendorInvoice } from "../../../finance/models/vendorInvoice.model";
import { VendorPayment } from "../../../finance/models/vendorPayment.model";
import { AnomalyFlag } from "../../models/anomalyFlag.model";
import { detectVendorPaymentAnomaly } from "../anomalyDetection.service";

describe("detectVendorPaymentAnomaly", () => {
  it("does not flag a payment consistent with vendor history", async () => {
    const tenant = await createTenant("Normal Payments Co");
    const vendor = await createVendor(tenant._id, "Steady Vendor");

    const historicalAmounts = [1000, 1050, 980, 1010, 990, 1020];
    for (const amount of historicalAmounts) {
      const invoice = await VendorInvoice.create({
        tenantId: tenant._id,
        vendorId: vendor._id,
        purchaseOrderId: tenant._id, // any ObjectId; not resolved in this test
        goodsReceiptId: tenant._id,
        invoiceNumber: `INV-${Math.random()}`,
        invoiceAmount: amount,
        status: "MATCHED",
      });
      await VendorPayment.create({
        tenantId: tenant._id,
        invoiceId: invoice._id,
        amount,
      });
    }

    const normalInvoice = await VendorInvoice.create({
      tenantId: tenant._id,
      vendorId: vendor._id,
      purchaseOrderId: tenant._id,
      goodsReceiptId: tenant._id,
      invoiceNumber: `INV-${Math.random()}`,
      invoiceAmount: 1005,
      status: "MATCHED",
    });
    const normalPayment = await VendorPayment.create({
      tenantId: tenant._id,
      invoiceId: normalInvoice._id,
      amount: 1005,
    });

    const flag = await detectVendorPaymentAnomaly({
      _id: normalPayment._id,
      tenantId: normalPayment.tenantId,
      invoiceId: normalPayment.invoiceId,
      amount: 1005,
    });

    expect(flag).toBeNull();
  });

  it("flags a payment that sharply deviates from vendor history", async () => {
    const tenant = await createTenant("Outlier Payments Co");
    const vendor = await createVendor(tenant._id, "Outlier Vendor");

    const historicalAmounts = [1000, 1050, 980, 1010, 990, 1020];
    for (const amount of historicalAmounts) {
      const invoice = await VendorInvoice.create({
        tenantId: tenant._id,
        vendorId: vendor._id,
        purchaseOrderId: tenant._id,
        goodsReceiptId: tenant._id,
        invoiceNumber: `INV-${Math.random()}`,
        invoiceAmount: amount,
        status: "MATCHED",
      });
      await VendorPayment.create({
        tenantId: tenant._id,
        invoiceId: invoice._id,
        amount,
      });
    }

    const outlierInvoice = await VendorInvoice.create({
      tenantId: tenant._id,
      vendorId: vendor._id,
      purchaseOrderId: tenant._id,
      goodsReceiptId: tenant._id,
      invoiceNumber: `INV-${Math.random()}`,
      invoiceAmount: 500000,
      status: "MATCHED",
    });
    const outlierPayment = await VendorPayment.create({
      tenantId: tenant._id,
      invoiceId: outlierInvoice._id,
      amount: 500000,
    });

    const flag = await detectVendorPaymentAnomaly({
      _id: outlierPayment._id,
      tenantId: outlierPayment.tenantId,
      invoiceId: outlierPayment.invoiceId,
      amount: 500000,
    });

    expect(flag).not.toBeNull();
    expect(flag!.get("severity")).toBe("HIGH");

    const persisted = await AnomalyFlag.findOne({ sourceId: outlierPayment._id });
    expect(persisted).not.toBeNull();
  });
});
