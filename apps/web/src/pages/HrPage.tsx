import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../lib/api";
import { Tabs } from "../components/Tabs";
import { SeverityBadge } from "../components/SeverityBadge";
import { useAuth } from "../lib/auth";

interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department?: string;
  designation?: string;
  salary?: number;
}

const EmployeesTab = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ employeeId: "", fullName: "", email: "", department: "", designation: "", salary: "" });
  const [error, setError] = useState("");

  const load = () => apiGet("/employees").then(setEmployees).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/employees", { ...form, salary: Number(form.salary) || 0 });
      setForm({ employeeId: "", fullName: "", email: "", department: "", designation: "", salary: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Failed to create employee");
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add employee</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <input placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
          <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input placeholder="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          <input placeholder="Salary" type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <button className="primary" type="submit" style={{ gridColumn: "span 1" }}>Add employee</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && employees.length === 0 && <p className="muted">No employees yet.</p>}
        {employees.length > 0 && (
          <table>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Salary</th></tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id}>
                  <td className="muted">{e.employeeId}</td>
                  <td>{e.fullName}</td>
                  <td className="muted">{e.email}</td>
                  <td>{e.department || "—"}</td>
                  <td>{e.designation || "—"}</td>
                  <td>{e.salary?.toLocaleString() ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface AttendanceRecord {
  _id: string;
  employeeId: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  overtimeHours?: number;
}

const AttendanceTab = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/attendance").then(setRecords).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const clockIn = async () => {
    setBusy(true);
    setMsg("");
    try {
      await apiPost("/attendance/clock-in");
      setMsg("Clocked in.");
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  const clockOut = async () => {
    setBusy(true);
    setMsg("");
    try {
      await apiPost("/attendance/clock-out");
      setMsg("Clocked out.");
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button className="primary" disabled={busy} onClick={clockIn}>Clock in</button>
        <button disabled={busy} onClick={clockOut}>Clock out</button>
        {msg && <span className="muted">{msg}</span>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && records.length === 0 && <p className="muted">No attendance records yet.</p>}
        {records.length > 0 && (
          <table>
            <thead><tr><th>Clock in</th><th>Clock out</th><th>Total hours</th><th>Overtime</th></tr></thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td className="muted">{new Date(r.clockIn).toLocaleString()}</td>
                  <td className="muted">{r.clockOut ? new Date(r.clockOut).toLocaleString() : "—"}</td>
                  <td>{r.totalHours ?? "—"}</td>
                  <td>{r.overtimeHours ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface LeaveRecord {
  _id: string;
  leaveType?: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason?: string;
}

const LeaveTab = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
  const [error, setError] = useState("");

  const load = () => apiGet("/leaves").then(setLeaves).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/leaves/apply", form);
      setForm({ leaveType: "CASUAL", startDate: "", endDate: "", reason: "" });
      load();
    } catch (err: any) {
      setError(err.message || "Failed to apply for leave");
    }
  };

  const decide = async (leaveId: string, status: "APPROVED" | "REJECTED") => {
    await apiPatch("/leaves/approve", { leaveId, status });
    load();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Apply for leave</h3>
        <form onSubmit={apply} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="ANNUAL">Annual</option>
            <option value="MATERNITY">Maternity</option>
            <option value="PATERNITY">Paternity</option>
            <option value="UNPAID">Unpaid</option>
          </select>
          <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
          <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
          <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          <button className="primary" type="submit">Apply</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && leaves.length === 0 && <p className="muted">No leave requests yet.</p>}
        {leaves.length > 0 && (
          <table>
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th>{(user?.role === "ADMIN" || user?.role === "HR") && <th />}</tr></thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l._id}>
                  <td>{l.leaveType || "—"}</td>
                  <td className="muted">{new Date(l.startDate).toLocaleDateString()}</td>
                  <td className="muted">{new Date(l.endDate).toLocaleDateString()}</td>
                  <td className="muted">{l.reason || "—"}</td>
                  <td><SeverityBadge label={l.status} /></td>
                  {(user?.role === "ADMIN" || user?.role === "HR") && (
                    <td>
                      {l.status === "PENDING" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => decide(l._id, "APPROVED")}>Approve</button>
                          <button className="danger" onClick={() => decide(l._id, "REJECTED")}>Reject</button>
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

export const HrPage = () => (
  <div>
    <h2>Human Resources</h2>
    <Tabs
      tabs={[
        { key: "employees", label: "Employees", content: <EmployeesTab /> },
        { key: "attendance", label: "Attendance", content: <AttendanceTab /> },
        { key: "leave", label: "Leave", content: <LeaveTab /> },
      ]}
    />
  </div>
);
