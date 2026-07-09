import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { SeverityBadge } from "../components/SeverityBadge";
import { useAuth } from "../lib/auth";

interface ApprovalRequest {
  _id: string;
  entityType: string;
  amount: number;
  riskScore: number;
  riskFactors: string[];
  decision: "PENDING" | "AUTO_APPROVED" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export const ApprovalsPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const load = () => {
    apiGet("/approvals")
      .then((res) => setRequests(res.requests || []))
      .finally(() => setLoading(false));
  };

  const reload = () => {
    setLoading(true);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id: string, decision: "APPROVED" | "REJECTED") => {
    setDecidingId(id);
    try {
      await apiPost(`/approvals/${id}/decide`, { decision });
      reload();
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div>
      <h2>Approvals</h2>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && requests.length === 0 && <p className="muted">No approval requests.</p>}
        {requests.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Entity</th>
                <th>Amount</th>
                <th>Risk score</th>
                <th>Risk factors</th>
                <th>Decision</th>
                <th>Requested</th>
                {user?.role === "ADMIN" && <th />}
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td>{r.entityType.replace(/_/g, " ")}</td>
                  <td>{r.amount.toLocaleString()}</td>
                  <td>{r.riskScore}</td>
                  <td className="muted">{r.riskFactors.join(", ") || "—"}</td>
                  <td>
                    <SeverityBadge label={r.decision} />
                  </td>
                  <td className="muted">{new Date(r.createdAt).toLocaleString()}</td>
                  {user?.role === "ADMIN" && (
                    <td>
                      {r.decision === "PENDING" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="primary"
                            disabled={decidingId === r._id}
                            onClick={() => decide(r._id, "APPROVED")}
                          >
                            Approve
                          </button>
                          <button
                            className="danger"
                            disabled={decidingId === r._id}
                            onClick={() => decide(r._id, "REJECTED")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
