import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function InvoicesPage() {
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({
    invoice_number: "",
    invoice_date: "",
    amount: "",
    description: "",
    account_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [acc, inv] = await Promise.all([
          api("/accounts"),
          api("/invoices")
        ]);
        setAccounts(acc);
        setInvoices(inv);
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }
    load();
  }, []);

  const incomeAccounts = accounts.filter((a) => a.category === "Income");

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        account_id: Number(form.account_id)
      };
      if (editingId) {
        const updated = await api(`/invoices/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === editingId ? updated : inv))
        );
        setViewInvoice((v) => (v?.id === editingId ? updated : v));
        showToast("success", `Invoice "${updated.invoice_number}" updated successfully.`);
      } else {
        const created = await api("/invoices", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setInvoices((prev) => [created, ...prev]);
        showToast("success", `Invoice "${created.invoice_number}" created successfully.`);
      }
      setForm({
        invoice_number: "",
        invoice_date: "",
        amount: "",
        description: "",
        account_id: ""
      });
      setEditingId(null);
      setCreateOpen(false);
    } catch (e) {
      showToast("error", e.message || "Failed to save invoice");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(inv) {
    setMenuOpenId(null);
    setEditingId(inv.id);
    setForm({
      invoice_number: inv.invoice_number || "",
      invoice_date: inv.invoice_date || "",
      amount: String(inv.amount ?? ""),
      description: inv.description || "",
      account_id: String(inv.account_id ?? "")
    });
    setCreateOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      invoice_number: "",
      invoice_date: "",
      amount: "",
      description: "",
      account_id: ""
    });
    setCreateOpen(false);
  }

  async function handleDelete(inv) {
    setMenuOpenId(null);
    if (!confirm(`Delete invoice "${inv.invoice_number}"? This will also remove any payments for this invoice.`)) return;
    setDeletingId(inv.id);
    try {
      await api(`/invoices/${inv.id}`, { method: "DELETE" });
      setInvoices((prev) => prev.filter((i) => i.id !== inv.id));
      if (viewInvoice?.id === inv.id) setViewInvoice(null);
      showToast("success", "Invoice deleted.");
    } catch (e) {
      showToast("error", e.message || "Failed to delete invoice");
    } finally {
      setDeletingId(null);
    }
  }

  function handleView(inv) {
    setMenuOpenId(null);
    setViewInvoice(inv);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Invoices
        </h2>
        <Button onClick={() => setCreateOpen(true)}>Create invoice</Button>
      </div>

      <Modal open={createOpen} onClose={editingId ? cancelEdit : () => setCreateOpen(false)} title={editingId ? "Edit invoice" : "Create invoice"}>
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="invoice_number">Invoice number</label>
              <input
                id="invoice_number"
                value={form.invoice_number}
                onChange={(e) => updateForm("invoice_number", e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="invoice_date">Date</label>
                <input
                  type="date"
                  id="invoice_date"
                  value={form.invoice_date}
                  onChange={(e) => updateForm("invoice_date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="amount">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  id="amount"
                  value={form.amount}
                  onChange={(e) => updateForm("amount", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="account_id">Income account</label>
              <select
                id="account_id"
                value={form.account_id}
                onChange={(e) => updateForm("account_id", e.target.value)}
                className="w-full"
                required
              >
                <option value="">Select income account</option>
                {incomeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={2}
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save changes" : "Create invoice"}
            </Button>
            <Button type="button" variant="ghost" onClick={editingId ? cancelEdit : () => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {viewInvoice && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Invoice details</h3>
            <button
              type="button"
              onClick={() => setViewInvoice(null)}
              className="text-xs text-slate-500 hover:underline"
            >
              Close
            </button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Invoice number</dt>
              <dd className="font-medium">{viewInvoice.invoice_number}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd>{viewInvoice.invoice_date ? new Date(viewInvoice.invoice_date).toLocaleDateString() : "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd>{Number(viewInvoice.amount).toFixed(2)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Account</dt>
              <dd>{viewInvoice.account_name || accounts.find((a) => a.id === viewInvoice.account_id)?.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd>
                <span className={viewInvoice.status === "Paid" ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                  {viewInvoice.status}
                </span>
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-slate-500">Description</dt>
              <dd className="text-slate-600">{viewInvoice.description || "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-visible">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Invoice</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 font-medium">{inv.invoice_number}</td>
                <td className="px-3 py-2 text-slate-600 max-w-[200px]">
                  {inv.description || "—"}
                </td>
                <td className="px-3 py-2">
                  {inv.account_name || (accounts.find((a) => a.id === inv.account_id)?.name) || inv.account_id}
                </td>
                <td className="px-3 py-2">
                  {inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-3 py-2">{Number(inv.amount).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      inv.status === "Paid"
                        ? "inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                        : "inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                    }
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === inv.id ? null : inv.id)}
                      className="rounded p-1.5 bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-0 min-w-0"
                      aria-label="Actions"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {menuOpenId === inv.id && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                          <button type="button" onClick={() => handleView(inv)} className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0">
                            View
                          </button>
                          <button type="button" onClick={() => startEdit(inv)} className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0">
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(inv)}
                            disabled={deletingId === inv.id}
                            className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 bg-transparent border-0"
                          >
                            {deletingId === inv.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={7}>
                  No invoices yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

