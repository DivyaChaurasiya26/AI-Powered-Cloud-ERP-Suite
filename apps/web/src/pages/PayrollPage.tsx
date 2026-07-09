import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { SeverityBadge } from "../components/SeverityBadge";
import { formatCurrency } from "../components/StatTile";

interface Employee {
  _id: string;
  fullName: string;
  employeeId: string;
}

interface PayrollRecord {
  _id: string;
  employeeId: Employee | string;
  month: string;
  year: number;
  basicSalary: number;
  deductions: number;
  bonus: number;
  netSalary: number;
  status: "PENDING" | "PAID";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export const PayrollPage = () => {
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ employeeId: "", month: MONTHS[new Date().getMonth()], year: new Date().getFullYear(), deductions: "", bonus: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/payroll").then((res) => setRecords(res.records || [])).finally(() => setLoading(false));

  useEffect(() => {
    load();
    apiGet("/employees").then(setEmployees).catch(() => setEmployees([]));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    if (!form.employeeId) {
      setMsg("Select an employee first.");
      return;
    }
    try {
      await apiPost("/payroll/run", {
        employeeId: form.employeeId,
        month: form.month,
        year: Number(form.year),
        deductions: Number(form.deductions) || 0,
        bonus: Number(form.bonus) || 0,
      });
      setMsg("Payroll job queued — refresh in a few seconds to see the result.");
      setTimeout(load, 2000);
    } catch (err: any) {
      setMsg(err.message || "Failed to queue payroll run");
    }
  };

  return (
    <div>
      <h2>Payroll</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Run payroll</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
          <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}>
            <option value="">Select employee…</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>{e.fullName} ({e.employeeId})</option>
            ))}
          </select>
          <select value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="number" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          <input type="number" placeholder="Extra deductions" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
          <input type="number" placeholder="Bonus" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} />
          <button className="primary" type="submit" style={{ gridColumn: "span 1" }}>Run payroll</button>
        </form>
        {msg && <p className="muted">{msg}</p>}
      </div>

      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && records.length === 0 && <p className="muted">No payroll records yet.</p>}
        {records.length > 0 && (
          <table>
            <thead>
              <tr><th>Employee</th><th>Period</th><th>Basic</th><th>Deductions</th><th>Bonus</th><th>Net salary</th><th>Status</th></tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{typeof r.employeeId === "object" ? r.employeeId.fullName : "—"}</td>
                  <td className="muted">{r.month} {r.year}</td>
                  <td>{formatCurrency(r.basicSalary)}</td>
                  <td className="muted">{formatCurrency(r.deductions)}</td>
                  <td className="muted">{formatCurrency(r.bonus)}</td>
                  <td>{formatCurrency(r.netSalary)}</td>
                  <td><SeverityBadge label={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
