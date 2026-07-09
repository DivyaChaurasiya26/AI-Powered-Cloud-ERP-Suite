import { z } from "zod";

const objectId = z.string().length(24, "Must be a valid 24-character ObjectId");

export const submitApprovalSchema = z.object({
  entityType: z.enum(["VENDOR_PAYMENT"], {
    required_error: "entityType is required",
  }),
  entityId: objectId,
  amount: z
    .number({ required_error: "amount is required" })
    .positive("amount must be positive"),
  payload: z.record(z.unknown()).optional(),
});

export const decideApprovalSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"], {
    required_error: "decision is required",
  }),
});
