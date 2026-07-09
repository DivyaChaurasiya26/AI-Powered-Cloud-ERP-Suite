import { computeRiskScore, isAutoApprovable } from "../riskScoring.service";

describe("riskScoring.service", () => {
  it("gives a low-risk score to a small amount with no anomaly", () => {
    const result = computeRiskScore({ amount: 500, hasOpenAnomaly: false });
    expect(result.score).toBe(0);
    expect(isAutoApprovable(result)).toBe(true);
  });

  it("raises the score for amounts above the auto-approve threshold", () => {
    const result = computeRiskScore({ amount: 75000, hasOpenAnomaly: false });
    expect(result.reasons).toContain("amount_exceeds_auto_approve_threshold");
    expect(result.score).toBeGreaterThan(0);
  });

  it("is not auto-approvable when an anomaly is linked, even for a small amount", () => {
    const result = computeRiskScore({ amount: 100, hasOpenAnomaly: true });
    expect(result.reasons).toContain("linked_anomaly_flag");
    expect(isAutoApprovable(result)).toBe(false);
  });

  it("caps the score at 100 for a high amount plus a linked anomaly", () => {
    const result = computeRiskScore({ amount: 1000000, hasOpenAnomaly: true });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(isAutoApprovable(result)).toBe(false);
  });
});
