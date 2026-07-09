import { mean, stdDev, zScore, iqrBounds } from "../statistics.service";

describe("statistics.service", () => {
  it("computes the mean of a list of numbers", () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
    expect(mean([])).toBe(0);
  });

  it("computes population standard deviation", () => {
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 5);
    expect(stdDev([5, 5, 5, 5])).toBe(0);
  });

  it("computes a z-score relative to a mean and stdDev", () => {
    expect(zScore(10, 5, 2.5)).toBeCloseTo(2, 5);
    expect(zScore(5, 5, 0)).toBe(0); // guards against divide-by-zero
  });

  it("flags a clear outlier via z-score on a tight cluster", () => {
    const history = [100, 102, 98, 101, 99, 100, 103, 97];
    const avg = mean(history);
    const sd = stdDev(history, avg);

    expect(Math.abs(zScore(100, avg, sd))).toBeLessThan(1);
    expect(Math.abs(zScore(5000, avg, sd))).toBeGreaterThan(3);
  });

  it("computes IQR bounds that exclude a distant outlier", () => {
    const { lower, upper } = iqrBounds([10, 12, 11, 13, 12, 11, 10, 12]);
    expect(500).toBeGreaterThan(upper);
    expect(-100).toBeLessThan(lower);
  });
});
