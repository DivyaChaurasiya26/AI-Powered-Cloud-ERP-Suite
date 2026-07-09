import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import { Tabs } from "../components/Tabs";
import { SeverityBadge } from "../components/SeverityBadge";
import { formatCurrency } from "../components/StatTile";

interface InventoryItem {
  _id: string;
  itemName: string;
  sku: string;
  quantity: number;
  reorderLevel: number;
  warehouseLocation: string;
  unitPrice: number;
}

const ItemsTab = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ itemName: "", sku: "", quantity: "", reorderLevel: "10", warehouseLocation: "", unitPrice: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/inventory").then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/inventory", {
        ...form,
        quantity: Number(form.quantity) || 0,
        reorderLevel: Number(form.reorderLevel) || 10,
        unitPrice: Number(form.unitPrice) || 0,
      });
      setForm({ itemName: "", sku: "", quantity: "", reorderLevel: "10", warehouseLocation: "", unitPrice: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create item");
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add stock item</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          <input placeholder="Item name" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
          <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <input placeholder="Warehouse location" value={form.warehouseLocation} onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })} required />
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input type="number" placeholder="Reorder level" value={form.reorderLevel} onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })} />
          <input type="number" placeholder="Unit price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
          <button className="primary" type="submit">Add item</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && items.length === 0 && <p className="muted">No stock items yet.</p>}
        {items.length > 0 && (
          <table>
            <thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Reorder at</th><th>Location</th><th>Unit price</th><th /></tr></thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id}>
                  <td>{i.itemName}</td>
                  <td className="muted">{i.sku}</td>
                  <td>{i.quantity}</td>
                  <td className="muted">{i.reorderLevel}</td>
                  <td className="muted">{i.warehouseLocation}</td>
                  <td>{formatCurrency(i.unitPrice)}</td>
                  <td>{i.quantity <= i.reorderLevel && <SeverityBadge label="LOW" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface PurchaseOrder {
  _id: string;
  vendorName: string;
  items: { inventoryItemId: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  status: "PENDING" | "APPROVED" | "RECEIVED";
}

const PurchaseOrdersTab = ({ items }: { items: InventoryItem[] }) => {
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ vendorName: "", inventoryItemId: "", quantity: "", unitPrice: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/purchase-orders").then(setPos).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/purchase-orders", {
        vendorName: form.vendorName,
        items: [{ inventoryItemId: form.inventoryItemId, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice) }],
      });
      setForm({ vendorName: "", inventoryItemId: "", quantity: "", unitPrice: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create purchase order");
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>New purchase order</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <input placeholder="Vendor name" value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} required />
          <select value={form.inventoryItemId} onChange={(e) => setForm({ ...form, inventoryItemId: e.target.value })} required>
            <option value="">Item…</option>
            {items.map((i) => <option key={i._id} value={i._id}>{i.itemName}</option>)}
          </select>
          <input type="number" placeholder="Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          <input type="number" placeholder="Unit price" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} required />
          <button className="primary" type="submit">Create PO</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && pos.length === 0 && <p className="muted">No purchase orders yet.</p>}
        {pos.length > 0 && (
          <table>
            <thead><tr><th>Vendor</th><th>Lines</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po._id}>
                  <td>{po.vendorName}</td>
                  <td className="muted">{po.items.length}</td>
                  <td>{formatCurrency(po.totalAmount)}</td>
                  <td><SeverityBadge label={po.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface GoodsReceipt {
  _id: string;
  purchaseOrderId: string;
  receivedItems: { inventoryItemId: string; quantityReceived: number }[];
  receivedDate: string;
}

const GoodsReceiptsTab = ({ pos, items }: { pos: PurchaseOrder[]; items: InventoryItem[] }) => {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ purchaseOrderId: "", inventoryItemId: "", quantityReceived: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/goods-receipts").then((res) => setReceipts(res.receipts || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/goods-receipts", {
        purchaseOrderId: form.purchaseOrderId,
        receivedItems: [{ inventoryItemId: form.inventoryItemId, quantityReceived: Number(form.quantityReceived) }],
      });
      setForm({ purchaseOrderId: "", inventoryItemId: "", quantityReceived: "" });
      setMsg("Goods received — stock updated.");
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to record goods receipt");
    }
  };

  const itemName = (id: string) => items.find((i) => i._id === id)?.itemName || id;

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Record goods receipt</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <select value={form.purchaseOrderId} onChange={(e) => setForm({ ...form, purchaseOrderId: e.target.value })} required>
            <option value="">Purchase order…</option>
            {pos.map((po) => <option key={po._id} value={po._id}>{po.vendorName} — {formatCurrency(po.totalAmount)}</option>)}
          </select>
          <select value={form.inventoryItemId} onChange={(e) => setForm({ ...form, inventoryItemId: e.target.value })} required>
            <option value="">Item…</option>
            {items.map((i) => <option key={i._id} value={i._id}>{i.itemName}</option>)}
          </select>
          <input type="number" placeholder="Quantity received" value={form.quantityReceived} onChange={(e) => setForm({ ...form, quantityReceived: e.target.value })} required />
          <button className="primary" type="submit">Receive</button>
        </form>
        {msg && <p className="muted">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && receipts.length === 0 && <p className="muted">No goods receipts yet.</p>}
        {receipts.length > 0 && (
          <table>
            <thead><tr><th>Received</th><th>Lines</th></tr></thead>
            <tbody>
              {receipts.map((r) => (
                <tr key={r._id}>
                  <td className="muted">{new Date(r.receivedDate).toLocaleString()}</td>
                  <td>{r.receivedItems.map((it) => `${itemName(it.inventoryItemId)} ×${it.quantityReceived}`).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

const VendorsTab = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [msg, setMsg] = useState("");

  const load = () => apiGet("/vendors").then(setVendors).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    try {
      await apiPost("/vendors", form);
      setForm({ name: "", email: "", phone: "", address: "" });
      load();
    } catch (err: any) {
      setMsg(err.message || "Failed to create vendor");
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Add vendor</h3>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="primary" type="submit">Add vendor</button>
        </form>
        {msg && <p className="error-text">{msg}</p>}
      </div>
      <div className="card">
        {loading && <p className="muted">Loading…</p>}
        {!loading && vendors.length === 0 && <p className="muted">No vendors yet.</p>}
        {vendors.length > 0 && (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v._id}>
                  <td>{v.name}</td>
                  <td className="muted">{v.email}</td>
                  <td className="muted">{v.phone || "—"}</td>
                  <td><SeverityBadge label={v.isActive ? "GOOD" : "DISMISSED"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export const InventoryPage = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    apiGet("/inventory").then(setItems).catch(() => setItems([]));
    apiGet("/purchase-orders").then(setPos).catch(() => setPos([]));
  }, []);

  return (
    <div>
      <h2>Inventory &amp; Procurement</h2>
      <Tabs
        tabs={[
          { key: "items", label: "Items", content: <ItemsTab /> },
          { key: "pos", label: "Purchase Orders", content: <PurchaseOrdersTab items={items} /> },
          { key: "receipts", label: "Goods Receipts", content: <GoodsReceiptsTab pos={pos} items={items} /> },
          { key: "vendors", label: "Vendors", content: <VendorsTab /> },
        ]}
      />
    </div>
  );
};
