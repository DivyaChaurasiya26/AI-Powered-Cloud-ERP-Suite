export const mean = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((sum, v) => sum + v, 0) / values.length;

export const stdDev = (values: number[], avg = mean(values)): number => {
  if (values.length === 0) return 0;
  const variance =
    values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
  return Math.sqrt(variance);
};

export const zScore = (value: number, avg: number, sd: number): number =>
  sd === 0 ? 0 : (value - avg) / sd;

export const iqrBounds = (
  values: number[]
): { lower: number; upper: number } => {
  if (values.length === 0) return { lower: 0, upper: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  return { lower: q1 - 1.5 * iqr, upper: q3 + 1.5 * iqr };
};
