interface BarChartProps {
  data: Array<{ label: string; value: number }>;
  colorVar?: string;
}

export const BarChart = ({ data, colorVar = "--series-1" }: BarChartProps) => {
  if (!data.length) return <p className="muted">No data</p>;

  const max = Math.max(...data.map((d) => d.value), 1);
  const barHeight = 18;
  const gap = 8;
  const height = data.length * (barHeight + gap);

  return (
    <svg width="100%" height={height} role="img" aria-label="Bar chart">
      {data.map((d, i) => {
        const widthPct = (d.value / max) * 100;
        const y = i * (barHeight + gap);
        return (
          <g key={d.label}>
            <text
              x={0}
              y={y + barHeight / 2 + 4}
              fontSize="11"
              fill="var(--text-secondary)"
            >
              {d.label}
            </text>
            <rect
              x="30%"
              y={y}
              width={`${(widthPct * 0.65).toFixed(2)}%`}
              height={barHeight}
              rx={4}
              fill={`var(${colorVar})`}
            />
          </g>
        );
      })}
    </svg>
  );
};
