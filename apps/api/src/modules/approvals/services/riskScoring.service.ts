const AUTO_APPROVE_AMOUNT_THRESHOLD = 50000;
const HIGH_AMOUNT_THRESHOLD = 200000;

export interface RiskScoreResult {
  score: number;
  reasons: string[];
}

export const computeRiskScore = ({
  amount,
  hasOpenAnomaly,
}: {
  amount: number;
  hasOpenAnomaly: boolean;
}): RiskScoreResult => {
  let score = 0;
  const reasons: string[] = [];

  if (amount >= HIGH_AMOUNT_THRESHOLD) {
    score += 60;
    reasons.push("amount_exceeds_high_threshold");
  } else if (amount >= AUTO_APPROVE_AMOUNT_THRESHOLD) {
    score += 30;
    reasons.push("amount_exceeds_auto_approve_threshold");
  }

  if (hasOpenAnomaly) {
    score += 50;
    reasons.push("linked_anomaly_flag");
  }

  return { score: Math.min(score, 100), reasons };
};

export const isAutoApprovable = (result: RiskScoreResult): boolean =>
  result.score < 30;
