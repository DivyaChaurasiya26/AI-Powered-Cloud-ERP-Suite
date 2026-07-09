import { useEffect, useState } from "react";
import { apiGet, apiPatch, apiPost, apiPut } from "../lib/api";
import { Tabs } from "../components/Tabs";

interface NotificationItem {
  _id: string;
  eventType: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const EVENT_TYPES = [
  "PROJECT_OVERRUN",
  "LEAVE_APPROVED",
  "PAYROLL_PROCESSED",
  "LOW_STOCK",
  "FORECAST_GENERATED",
  "ANOMALY_DETECTED",
  "APPROVAL_REQUIRED",
  "APPROVAL_DECIDED",
];

const InboxTab = () => {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => apiGet("/notifications").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await apiPatch(`/notifications/${id}/read`);
    load();
  };

  const markAllRead = async () => {
    await apiPost("/notifications/read-all");
    load();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="muted">{items.filter((n) => !n.isRead).length} unread</span>
        <button onClick={markAllRead}>Mark all read</button>
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && items.length === 0 && <p className="muted">No notifications yet.</p>}
        {items.length > 0 && (
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>Message</th><th>When</th><th /></tr></thead>
            <tbody>
              {items.map((n) => (
                <tr key={n._id} style={{ opacity: n.isRead ? 0.6 : 1 }}>
                  <td className="muted">{n.eventType.replace(/_/g, " ")}</td>
                  <td>{n.title}</td>
                  <td className="muted">{n.message}</td>
                  <td className="muted">{new Date(n.createdAt).toLocaleString()}</td>
                  <td>{!n.isRead && <button onClick={() => markRead(n._id)}>Mark read</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface ChannelPrefs { email: boolean; inApp: boolean; webhook: boolean }
type Prefs = Record<string, ChannelPrefs | string> & { webhookUrl?: string };

const PreferencesTab = () => {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    apiGet("/notifications/preferences").then(setPrefs);
  }, []);

  const toggle = (eventType: string, channel: keyof ChannelPrefs) => {
    if (!prefs) return;
    const current = prefs[eventType] as ChannelPrefs;
    setPrefs({ ...prefs, [eventType]: { ...current, [channel]: !current[channel] } });
  };

  const save = async () => {
    if (!prefs) return;
    setMsg("");
    try {
      await apiPut("/notifications/preferences", prefs);
      setMsg("Preferences saved.");
    } catch (err: any) {
      setMsg(err.message || "Failed to save preferences");
    }
  };

  if (!prefs) return <p className="muted">Loading…</p>;

  return (
    <div className="card">
      <table>
        <thead><tr><th>Event</th><th>Email</th><th>In-app</th><th>Webhook</th></tr></thead>
        <tbody>
          {EVENT_TYPES.map((et) => {
            const c = (prefs[et] as ChannelPrefs) || { email: false, inApp: false, webhook: false };
            return (
              <tr key={et}>
                <td>{et.replace(/_/g, " ")}</td>
                <td><input type="checkbox" checked={c.email} onChange={() => toggle(et, "email")} /></td>
                <td><input type="checkbox" checked={c.inApp} onChange={() => toggle(et, "inApp")} /></td>
                <td><input type="checkbox" checked={c.webhook} onChange={() => toggle(et, "webhook")} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button className="primary" onClick={save}>Save preferences</button>
        {msg && <span className="muted">{msg}</span>}
      </div>
    </div>
  );
};

export const NotificationsPage = () => (
  <div>
    <h2>Notifications</h2>
    <Tabs
      tabs={[
        { key: "inbox", label: "Inbox", content: <InboxTab /> },
        { key: "preferences", label: "Preferences", content: <PreferencesTab /> },
      ]}
    />
  </div>
);
