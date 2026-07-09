import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Tabs } from "../components/Tabs";
import { SeverityBadge } from "../components/SeverityBadge";
import { useAuth } from "../lib/auth";

interface AuditEntry {
  _id: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  entityType: string;
  method: string;
  path: string;
  statusCode: number;
  createdAt: string;
  hash: string;
}

interface ChainStatus {
  valid: boolean;
  checked: number;
  brokenAtId?: string;
}

const TrailTab = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chain, setChain] = useState<ChainStatus | null>(null);
  const [entityType, setEntityType] = useState("");

  const load = () => {
    setLoading(true);
    const qs = entityType ? `?entityType=${encodeURIComponent(entityType)}` : "";
    apiGet(`/audit-log${qs}`)
      .then((res) => { setLogs(res.logs || []); setTotal(res.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [entityType]);

  const verify = async () => {
    const res = await apiGet("/audit-log/chain-status");
    setChain(res);
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="Filter by entity (e.g. employees)" value={entityType} onChange={(e) => setEntityType(e.target.value)} />
          <span className="muted">{total} entries</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={verify}>Verify hash chain</button>
          {chain && (
            <span className="muted">
              <SeverityBadge label={chain.valid ? "GOOD" : "CRITICAL"} /> {chain.checked} entries checked
              {!chain.valid && ` — tampered at ${chain.brokenAtId}`}
            </span>
          )}
        </div>
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && logs.length === 0 && <p className="muted">No mutations recorded yet — every POST/PATCH/PUT/DELETE across the app writes an entry here.</p>}
        {logs.length > 0 && (
          <table>
            <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Path</th><th>Status</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l._id}>
                  <td className="muted">{new Date(l.createdAt).toLocaleString()}</td>
                  <td><SeverityBadge label={l.action} /></td>
                  <td>{l.entityType}</td>
                  <td className="muted">{l.method} {l.path}</td>
                  <td>{l.statusCode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const MyDataTab = () => {
  const [msg, setMsg] = useState("");

  const exportData = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/audit-log/gdpr/export", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const erase = async () => {
    if (!confirm("This will anonymize your profile and deactivate your account. Continue?")) return;
    try {
      const res = await apiPost("/audit-log/gdpr/erase");
      setMsg(res.message);
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Your data (GDPR)</h3>
      <p className="muted">Export everything tied to your account, or request erasure of your personal information.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={exportData}>Export my data</button>
        <button className="danger" onClick={erase}>Erase my data</button>
      </div>
      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
};

const SecurityTab = () => {
  const [status, setStatus] = useState<{ mfaEnabled: boolean } | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/auth/mfa/status").then(setStatus);
  useEffect(() => { load(); }, []);

  const beginSetup = async () => {
    setMsg("");
    const res = await apiPost("/auth/mfa/setup");
    setSetup(res);
  };

  const confirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/auth/mfa/confirm", { code });
      setSetup(null);
      setCode("");
      setMsg("MFA enabled — you'll be asked for a code on every future login.");
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  const disable = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/auth/mfa/disable", { code });
      setCode("");
      setMsg("MFA disabled.");
      load();
    } catch (err: any) {
      setMsg(err.message);
    }
  };

  if (!status) return <p className="muted">Loading…</p>;

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h3 style={{ marginTop: 0 }}>Two-factor authentication</h3>

      {status.mfaEnabled && !setup && (
        <div>
          <p className="muted">MFA is enabled on your account.</p>
          <form onSubmit={disable} style={{ display: "flex", gap: 8 }}>
            <input inputMode="numeric" maxLength={6} placeholder="Code to disable" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            <button className="danger" type="submit" disabled={code.length !== 6}>Disable MFA</button>
          </form>
        </div>
      )}

      {!status.mfaEnabled && !setup && (
        <div>
          <p className="muted">Add a second factor using any TOTP authenticator app (Google Authenticator, Authy, 1Password…).</p>
          <button className="primary" onClick={beginSetup}>Set up MFA</button>
        </div>
      )}

      {setup && (
        <form onSubmit={confirmSetup}>
          <p className="muted">Scan this into your authenticator app, or enter the secret manually:</p>
          <div className="card" style={{ fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", marginBottom: 12 }}>
            {setup.secret}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input inputMode="numeric" maxLength={6} placeholder="Code from app" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} autoFocus />
            <button className="primary" type="submit" disabled={code.length !== 6}>Confirm &amp; enable</button>
          </div>
        </form>
      )}

      {msg && <p className="muted" style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  );
};

export const AuditLogPage = () => {
  const { user } = useAuth();
  const tabs = [
    { key: "security", label: "Security", content: <SecurityTab /> },
    { key: "my-data", label: "My Data", content: <MyDataTab /> },
  ];
  if (user?.role === "ADMIN") {
    tabs.unshift({ key: "trail", label: "Audit Trail", content: <TrailTab /> });
  }

  return (
    <div>
      <h2>Audit &amp; Compliance</h2>
      <Tabs tabs={tabs} />
    </div>
  );
};
