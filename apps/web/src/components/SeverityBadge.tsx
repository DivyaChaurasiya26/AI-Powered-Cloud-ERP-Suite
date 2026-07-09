const STATUS_COLOR: Record<string, string> = {
  LOW: "var(--status-good)",
  GOOD: "var(--status-good)",
  MEDIUM: "var(--status-warning)",
  WARNING: "var(--status-warning)",
  HIGH: "var(--status-critical)",
  CRITICAL: "var(--status-critical)",
  PENDING: "var(--status-warning)",
  AUTO_APPROVED: "var(--status-good)",
  APPROVED: "var(--status-good)",
  REJECTED: "var(--status-critical)",
  OPEN: "var(--status-warning)",
  REVIEWED: "var(--status-good)",
  DISMISSED: "var(--text-muted)",
};

export const SeverityBadge = ({ label }: { label: string }) => (
  <span className="badge">
    <span className="dot" style={{ background: STATUS_COLOR[label] || "var(--text-muted)" }} />
    {label.replace(/_/g, " ")}
  </span>
);
