import eventBus from "../../../config/eventBus";
import { ApprovalRequest } from "../models/approvalRequest.model";
import { VendorInvoice } from "../../finance/models/vendorInvoice.model";
import { VendorPayment } from "../../finance/models/vendorPayment.model";
import { User } from "../../auth/models/user.model";
import {
  assessVendorPaymentRisk,
  detectVendorPaymentAnomaly,
} from "../../anomaly/services/anomalyDetection.service";
import { computeRiskScore, isAutoApprovable } from "./riskScoring.service";

type EntityType = "VENDOR_PAYMENT";

const applyEntityDecision: Record<
  EntityType,
  (entityId: any, payload: Record<string, any>) => Promise<unknown>
> = {
  VENDOR_PAYMENT: async (entityId, payload) => {
    const invoice = await VendorInvoice.findById(entityId);
    if (!invoice) throw new Error("VendorInvoice not found");

    const payment = await VendorPayment.create({
      tenantId: invoice.tenantId,
      invoiceId: invoice._id,
      amount: invoice.invoiceAmount,
      paymentMethod: payload.paymentMethod || "BANK_TRANSFER",
    });

    invoice.set("status", "PAID");
    await invoice.save();

    // Post-hoc: persist an AnomalyFlag for visibility/audit even though the
    // payment was already approved (risk scoring and outlier detection use
    // different thresholds, so this can surface signal auto-approval missed).
    await detectVendorPaymentAnomaly({
      _id: payment._id,
      tenantId: payment.tenantId,
      invoiceId: payment.invoiceId,
      amount: payment.amount as number,
    });

    return payment;
  },
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

export const submitForApproval = async ({
  entityType,
  entityId,
  tenantId,
  requestedBy,
  amount,
  payload = {},
}: {
  entityType: EntityType;
  entityId: any;
  tenantId: any;
  requestedBy: any;
  amount: number;
  payload?: Record<string, any>;
}) => {
  let hasOpenAnomaly = false;
  if (entityType === "VENDOR_PAYMENT") {
    const invoice = await VendorInvoice.findById(entityId).lean();
    if (invoice) {
      const assessment = await assessVendorPaymentRisk(
        tenantId,
        (invoice as any).vendorId,
        amount
      );
      hasOpenAnomaly = assessment.isOutlier;
    }
  }

  const risk = computeRiskScore({ amount, hasOpenAnomaly });
  const autoApprovable = isAutoApprovable(risk);

  const request = await ApprovalRequest.create({
    tenantId,
    entityType,
    entityId,
    requestedBy,
    amount,
    riskScore: risk.score,
    riskFactors: risk.reasons,
    payload,
    decision: autoApprovable ? "AUTO_APPROVED" : "PENDING",
    decidedAt: autoApprovable ? new Date() : undefined,
  });

  if (autoApprovable) {
    const result = await applyEntityDecision[entityType](entityId, payload);
    return { request, autoApproved: true, result };
  }

  await notifyTenantAdmins(String(tenantId), {
    eventType: "APPROVAL_REQUIRED",
    title: "Approval required",
    message: `A ${entityType.toLowerCase().replace("_", " ")} of ${amount} requires manual approval (risk score ${risk.score}).`,
    metadata: { approvalRequestId: request._id, entityType, entityId },
  });

  return { request, autoApproved: false, result: null };
};

export const decide = async (
  approvalRequestId: any,
  decision: "APPROVED" | "REJECTED",
  decidedBy: any
) => {
  const request = await ApprovalRequest.findById(approvalRequestId);
  if (!request) throw new Error("Approval request not found");
  if (request.get("decision") !== "PENDING") {
    throw new Error("Approval request has already been decided");
  }

  request.set("decision", decision);
  request.set("decidedBy", decidedBy);
  request.set("decidedAt", new Date());
  await request.save();

  let result = null;
  if (decision === "APPROVED") {
    result = await applyEntityDecision[request.get("entityType") as EntityType](
      request.get("entityId"),
      request.get("payload") || {}
    );
  }

  await notifyTenantAdmins(String(request.get("tenantId")), {
    eventType: "APPROVAL_DECIDED",
    title: `Approval ${decision.toLowerCase()}`,
    message: `Request for ${request.get("entityType")} ${request.get("entityId")} was ${decision.toLowerCase()}.`,
    metadata: { approvalRequestId: request._id, decision },
  });

  return { request, result };
};
