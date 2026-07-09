import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../lib/api";
import { SeverityBadge } from "../components/SeverityBadge";
import { useAuth } from "../lib/auth";

interface AnomalyFlag {
  _id: string;
  sourceType: string;
  metricValue: number;
  score: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "REVIEWED" | "DISMISSED";
  createdAt: string;
}

export const AnomaliesPage = () => {
  const { user } = useAuth();
  const [anomalies, setAnomalies] = useState<AnomalyFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  const load = () => {
    apiGet("/anomaly")
      .then((res) => setAnomalies(res.anomalies || []))
      .finally(() => setLoading(false));
  };

  const reload = () => {
    setLoading(true);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    await apiPatch(`/anomaly/${id}`, { status });
    reload();
  };

  const runScan = async () => {
    setScanning(true);
    try {
      await apiPost("/anomaly/scan");
      reload();
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h2>Anomalies</h2>
        {user?.role === "ADMIN" && (
          <button className="primary" onClick={runScan} disabled={scanning}>
            {scanning ? "Scanning…" : "Run scan"}
          </button>
        )}
      </div>

      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && anomalies.length === 0 && <p className="muted">No anomalies flagged.</p>}
        {anomalies.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Metric value</th>
                <th>Z-score</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Detected</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {anomalies.map((a) => (
                <tr key={a._id}>
                  <td>{a.sourceType.replace(/_/g, " ")}</td>
                  <td>{a.metricValue.toLocaleString()}</td>
                  <td>{a.score.toFixed(2)}</td>
                  <td>
                    <SeverityBadge label={a.severity} />
                  </td>
                  <td>
                    <SeverityBadge label={a.status} />
                  </td>
                  <td className="muted">{new Date(a.createdAt).toLocaleString()}</td>
                  <td>
                    {a.status === "OPEN" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => updateStatus(a._id, "REVIEWED")}>Review</button>
                        <button onClick={() => updateStatus(a._id, "DISMISSED")}>Dismiss</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
