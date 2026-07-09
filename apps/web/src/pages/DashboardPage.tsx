import { useEffect, useRef, useState } from "react";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { apiGet, API_BASE_URL } from "../lib/api";
import { StatTile, formatCurrency } from "../components/StatTile";
import { BarChart } from "../components/BarChart";

interface KpiData {
  revenue?: { totalRevenue: number; paidRevenue: number; pendingRevenue: number };
  expenses?: { totalExpenses: number; paidExpenses: number; pendingExpenses: number };
  inventory?: { totalItems: number; lowStockItems: number; inventoryValue: number };
  payroll?: { headcount: number; totalGrossSalary: number; totalNetSalary: number };
}

interface Widget {
  widgetId: string;
  title: string;
  chartType: string;
  data?: Array<{ label: string; value: number }>;
}

export const DashboardPage = () => {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [liveConnected, setLiveConnected] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    apiGet("/dashboard/kpis")
      .then(setKpis)
      .catch(() => setKpis(null));

    apiGet("/dashboard/widgets")
      .then((res) => setWidgets(res.widgets || []))
      .catch(() => setWidgets([]));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const token = localStorage.getItem("token");

    fetchEventSource(`${API_BASE_URL}/dashboard/live`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
      onopen: async (res) => {
        if (res.ok) setLiveConnected(true);
      },
      onmessage: (ev) => {
        if (ev.event === "kpi_update") {
          try {
            setKpis(JSON.parse(ev.data));
          } catch {
            // ignore malformed frame
          }
        }
      },
      onerror: () => {
        setLiveConnected(false);
      },
      onclose: () => {
        setLiveConnected(false);
      },
    }).catch(() => setLiveConnected(false));

    return () => controller.abort();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2>Dashboard</h2>
        <span className="muted" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: liveConnected ? "var(--status-good)" : "var(--text-muted)",
              boxShadow: liveConnected ? "0 0 0 3px color-mix(in srgb, var(--status-good) 22%, transparent)" : "none",
              animation: liveConnected ? "live-pulse 2s ease-in-out infinite" : "none",
            }}
          />
          {liveConnected ? "Live" : "Connecting…"}
        </span>
      </div>

      <div className="stat-grid">
        <StatTile
          label="Revenue"
          value={formatCurrency(kpis?.revenue?.totalRevenue)}
          colorVar="--series-1"
        />
        <StatTile
          label="Expenses"
          value={formatCurrency(kpis?.expenses?.totalExpenses)}
          colorVar="--series-2"
        />
        <StatTile
          label="Inventory Value"
          value={formatCurrency(kpis?.inventory?.inventoryValue)}
          colorVar="--series-3"
        />
        <StatTile
          label="Net Payroll"
          value={formatCurrency(kpis?.payroll?.totalNetSalary)}
          colorVar="--series-5"
        />
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Widgets</h3>
        {widgets.length === 0 && <p className="muted">No dashboard widgets configured yet.</p>}
        {widgets.map((w) => (
          <div key={w.widgetId} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>{w.title}</div>
            <BarChart data={w.data || []} />
          </div>
        ))}
      </div>
    </div>
  );
};
