import eventBus from "../../../config/eventBus";
import { AnomalyFlag } from "../models/anomalyFlag.model";
import { VendorPayment } from "../../finance/models/vendorPayment.model";
import { VendorInvoice } from "../../finance/models/vendorInvoice.model";
import { GoodsReceipt } from "../../inventory/models/goodsReceipt.model";
import { User } from "../../auth/models/user.model";
import { mean, stdDev, zScore, iqrBounds } from "./statistics.service";

const Z_SCORE_THRESHOLD = 3;
const MIN_HISTORY_POINTS = 5;

export interface OutlierAssessment {
  isOutlier: boolean;
  severity: "LOW" | "MEDIUM" | "HIGH";
  score: number;
  baseline: { mean: number; stdDev: number };
  sampleSize: number;
}

const severityFor = (absZ: number): "LOW" | "MEDIUM" | "HIGH" => {
  if (absZ >= 5) return "HIGH";
  if (absZ >= Z_SCORE_THRESHOLD) return "MEDIUM";
  return "LOW";
};

const assessOutlier = (value: number, history: number[]): OutlierAssessment => {
  if (history.length < MIN_HISTORY_POINTS) {
    return {
      isOutlier: false,
      severity: "LOW",
      score: 0,
      baseline: { mean: 0, stdDev: 0 },
      sampleSize: history.length,
    };
  }

  const avg = mean(history);
  const sd = stdDev(history, avg);
  const z = zScore(value, avg, sd);
  const { lower, upper } = iqrBounds(history);
  const absZ = Math.abs(z);
  const isOutlier = absZ > Z_SCORE_THRESHOLD || value < lower || value > upper;

  return {
    isOutlier,
    severity: severityFor(absZ),
    score: z,
    baseline: { mean: avg, stdDev: sd },
    sampleSize: history.length,
  };
};

const notifyTenantAdmins = async (
  tenantId: string,
  payload: { eventType: string; title: string; message: string; metadata?: object }
) => {
  const admins = await User.find({ tenantId, role: "ADMIN" }).select("_id").lean();
  for (const admin of admins) {
    eventBus.emit(`notification.${payload.eventType.toLowerCase()}`, {
      userId: String(admin._id),
      tenantId: String(tenantId),
      ...payload,
    });
  }
};

/**
 * Pre-hoc risk assessment used by the approvals engine before a payment
 * exists yet — compares a candidate amount against the vendor's historical
 * payment distribution without persisting an AnomalyFlag.
 */
export const assessVendorPaymentRisk = async (
  tenantId: any,
  vendorId: any,
  amount: number
): Promise<OutlierAssessment> => {
  const sameVendorInvoiceIds = await VendorInvoice.find({ tenantId, vendorId })
    .select("_id")
    .lean();
  const invoiceIds = sameVendorInvoiceIds.map((i) => i._id);

  const history = await VendorPayment.find({
    tenantId,
    invoiceId: { $in: invoiceIds },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return assessOutlier(
    amount,
    history.map((h) => h.amount as number)
  );
};

/**
 * Post-hoc detection on an already-created VendorPayment — persists an
 * AnomalyFlag and notifies tenant admins on HIGH severity.
 */
export const detectVendorPaymentAnomaly = async (payment: {
  _id: any;
  tenantId: any;
  invoiceId: any;
  amount: number;
}) => {
  const invoice = await VendorInvoice.findById(payment.invoiceId).lean();
  if (!invoice) return null;

  const assessment = await assessVendorPaymentRisk(
    payment.tenantId,
    (invoice as any).vendorId,
    payment.amount
  );
  if (!assessment.isOutlier) return null;

  const flag = await AnomalyFlag.create({
    tenantId: payment.tenantId,
    sourceType: "VENDOR_PAYMENT",
    sourceId: payment._id,
    metricValue: payment.amount,
    baseline: assessment.baseline,
    score: assessment.score,
    severity: assessment.severity,
  });

  if (assessment.severity === "HIGH") {
    await notifyTenantAdmins(String(payment.tenantId), {
      eventType: "ANOMALY_DETECTED",
      title: "High-severity payment anomaly detected",
      message: `A vendor payment of ${payment.amount} deviates sharply (z=${assessment.score.toFixed(
        2
      )}) from this vendor's historical payment pattern.`,
      metadata: { anomalyFlagId: flag._id, sourceType: "VENDOR_PAYMENT", sourceId: payment._id },
    });
  }

  return flag;
};

export const detectInventoryMovementAnomaly = async (
  tenantId: any,
  goodsReceiptId: any,
  inventoryItemId: any,
  quantityReceived: number
) => {
  const history = await GoodsReceipt.find({
    tenantId,
    "receivedItems.inventoryItemId": inventoryItemId,
    _id: { $ne: goodsReceiptId },
  })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  const quantities = history.flatMap((gr) =>
    (gr.receivedItems as any[])
      .filter((item) => String(item.inventoryItemId) === String(inventoryItemId))
      .map((item) => item.quantityReceived as number)
  );

  const assessment = assessOutlier(quantityReceived, quantities);
  if (!assessment.isOutlier) return null;

  const flag = await AnomalyFlag.create({
    tenantId,
    sourceType: "INVENTORY_MOVEMENT",
    sourceId: goodsReceiptId,
    metricValue: quantityReceived,
    baseline: assessment.baseline,
    score: assessment.score,
    severity: assessment.severity,
  });

  if (assessment.severity === "HIGH") {
    await notifyTenantAdmins(String(tenantId), {
      eventType: "ANOMALY_DETECTED",
      title: "Unusual inventory receipt quantity detected",
      message: `A goods receipt quantity of ${quantityReceived} deviates sharply (z=${assessment.score.toFixed(
        2
      )}) from this item's historical receipt pattern.`,
      metadata: { anomalyFlagId: flag._id, sourceType: "INVENTORY_MOVEMENT", sourceId: goodsReceiptId },
    });
  }

  return flag;
};

export const runTenantScan = async (tenantId: any) => {
  const flags: any[] = [];

  const recentPayments = await VendorPayment.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  for (const payment of recentPayments) {
    const flag = await detectVendorPaymentAnomaly(payment as any);
    if (flag) flags.push(flag);
  }

  const recentReceipts = await GoodsReceipt.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  for (const receipt of recentReceipts) {
    for (const item of receipt.receivedItems as any[]) {
      const flag = await detectInventoryMovementAnomaly(
        tenantId,
        receipt._id,
        item.inventoryItemId,
        item.quantityReceived
      );
      if (flag) flags.push(flag);
    }
  }

  return flags;
};
