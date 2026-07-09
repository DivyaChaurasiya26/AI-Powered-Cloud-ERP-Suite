interface StatTileProps {
  label: string;
  value: string;
  colorVar: string;
}

export const StatTile = ({ label, value, colorVar }: StatTileProps) => (
  <div className="card stat-tile">
    <div className="label">
      <span className="swatch" style={{ background: `var(${colorVar})` }} />
      {label}
    </div>
    <div className="value">{value}</div>
  </div>
);

export const formatCurrency = (n: number | undefined) =>
  n === undefined
    ? "—"
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
