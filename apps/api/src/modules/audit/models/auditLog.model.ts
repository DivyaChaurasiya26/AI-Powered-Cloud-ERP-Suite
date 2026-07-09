import { Schema, model } from "mongoose";

// Append-only: no route ever updates or deletes a document in this
// collection. `hash` chains to `previousHash` (per tenant) so any row
// tampered with or removed breaks the chain for every entry after it —
// verifiable via auditLog.service.verifyChain().
const auditLogSchema = new Schema(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "READ_SENSITIVE"],
      required: true,
    },

    entityType: {
      type: String,
      required: true,
    },

    method: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    statusCode: {
      type: Number,
      required: true,
    },

    ip: {
      type: String,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    previousHash: {
      type: String,
      default: null,
    },

    hash: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ tenantId: 1, entityType: 1, createdAt: -1 });

export const AuditLog = model("AuditLog", auditLogSchema);
