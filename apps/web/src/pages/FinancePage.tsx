import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch } from "../lib/api";
import { Tabs } from "../components/Tabs";
import { SeverityBadge } from "../components/SeverityBadge";
import { formatCurrency } from "../components/StatTile";

interface APInvoice {
  _id: string;
  vendorName: string;
  invoiceNumber: string;
  invoiceAmount: number;
  dueDate: string;
  status: "PENDING" | "PAID";
}

const ApTab = () => {
  const [invoices, setInvoices] = useState<APInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ vendorName: "", invoiceNumber: "", invoiceAmount: "", dueDate: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/ap/invoice").then((res) => setInvoices(res.invoices || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/ap/invoice", { ...form, invoiceAmount: Number(form.invoiceAmount) });
      setForm({ vendorName: "", invoiceNumber: "", invoiceAmount: "", dueDate: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create invoice");
    }
  };

  const pay = async (invoiceId: string) => {
    await apiPatch("/ap/pay", { invoiceId });
    load();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New AP invoice (payable)</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <input placeholder="Vendor name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} required />
          <input placeholder="Invoice number" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />
          <input type="number" placeholder="Amount" value={form.invoiceAmount} onChange={(e) => setForm({ ...form, invoiceAmount: e.target.value })} required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <button className="primary" type="submit">Create invoice</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && invoices.length === 0 && <p className="muted">No AP invoices yet.</p>}
        {invoices.length > 0 && (
          <table>
            <thead><tr><th>Vendor</th><th>Invoice #</th><th>Amount</th><th>Due</th><th>Status</th><th /></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.vendorName}</td>
                  <td className="muted">{inv.invoiceNumber}</td>
                  <td>{formatCurrency(inv.invoiceAmount)}</td>
                  <td className="muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td><SeverityBadge label={inv.status} /></td>
                  <td>{inv.status === "PENDING" && <button onClick={() => pay(inv._id)}>Mark paid</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface ARInvoice {
  _id: string;
  customerName: string;
  invoiceNumber: string;
  invoiceAmount: number;
  dueDate: string;
  status: "PENDING" | "PAID";
}

const ArTab = () => {
  const [invoices, setInvoices] = useState<ARInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ customerName: "", invoiceNumber: "", invoiceAmount: "", dueDate: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/ar/invoice").then((res) => setInvoices(res.invoices || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/ar/invoice", { ...form, invoiceAmount: Number(form.invoiceAmount) });
      setForm({ customerName: "", invoiceNumber: "", invoiceAmount: "", dueDate: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create invoice");
    }
  };

  const receive = async (invoiceId: string) => {
    await apiPatch("/ar/receive-payment", { invoiceId });
    load();
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New AR invoice (receivable)</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <input placeholder="Customer name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
          <input placeholder="Invoice number" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} required />
          <input type="number" placeholder="Amount" value={form.invoiceAmount} onChange={(e) => setForm({ ...form, invoiceAmount: e.target.value })} required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <button className="primary" type="submit">Create invoice</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && invoices.length === 0 && <p className="muted">No AR invoices yet.</p>}
        {invoices.length > 0 && (
          <table>
            <thead><tr><th>Customer</th><th>Invoice #</th><th>Amount</th><th>Due</th><th>Status</th><th /></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.customerName}</td>
                  <td className="muted">{inv.invoiceNumber}</td>
                  <td>{formatCurrency(inv.invoiceAmount)}</td>
                  <td className="muted">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td><SeverityBadge label={inv.status} /></td>
                  <td>
                    {inv.status === "PENDING" && <button onClick={() => receive(inv._id)}>Receive payment</button>}
                    {" "}
                    <a href={`/api/ar/invoice/${inv._id}/pdf`} target="_blank" rel="noreferrer">PDF</a>
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

interface VendorInvoice {
  _id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceAmount: number;
  status: "PENDING" | "MATCHED" | "PAID" | "REJECTED";
}

const VendorInvoicesTab = () => {
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/vendor-invoices").then((res) => setInvoices(res.invoices || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const pay = async (invoiceId: string) => {
    setPayingId(invoiceId);
    setMsg("");
    try {
      const res = await apiPost("/vendor-payments", { invoiceId, paymentMethod: "BANK_TRANSFER" });
      setMsg(res.message);
      load();
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="card">
      {msg && <p className="muted">{msg}</p>}
      {loading && <p className="muted">Loading…</p>}
      {!loading && invoices.length === 0 && <p className="muted">No vendor invoices yet. Created via 3-way match against a purchase order + goods receipt.</p>}
      {invoices.length > 0 && (
        <table>
          <thead><tr><th>Invoice #</th><th>Amount</th><th>Status</th><th /></tr></thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className="muted">{inv.invoiceNumber}</td>
                <td>{formatCurrency(inv.invoiceAmount)}</td>
                <td><SeverityBadge label={inv.status} /></td>
                <td>
                  {inv.status === "MATCHED" && (
                    <button className="primary" disabled={payingId === inv._id} onClick={() => pay(inv._id)}>Pay</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

interface VendorPayment {
  _id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
}

const VendorPaymentsTab = () => {
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/vendor-payments").then((res) => setPayments(res.payments || [])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      {loading && <p className="muted">Loading…</p>}
      {!loading && payments.length === 0 && <p className="muted">No vendor payments recorded yet.</p>}
      {payments.length > 0 && (
        <table>
          <thead><tr><th>Amount</th><th>Method</th><th>Paid on</th></tr></thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p._id}>
                <td>{formatCurrency(p.amount)}</td>
                <td className="muted">{p.paymentMethod.replace(/_/g, " ")}</td>
                <td className="muted">{new Date(p.paymentDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export const FinancePage = () => (
  <div>
    <h2>Finance</h2>
    <Tabs
      tabs={[
        { key: "ap", label: "AP Invoices", content: <ApTab /> },
        { key: "ar", label: "AR Invoices", content: <ArTab /> },
        { key: "vendor-invoices", label: "Vendor Invoices", content: <VendorInvoicesTab /> },
        { key: "vendor-payments", label: "Vendor Payments", content: <VendorPaymentsTab /> },
      ]}
    />
  </div>
);
