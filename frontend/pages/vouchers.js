import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function VouchersPage() {
  const [accounts, setAccounts] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [form, setForm] = useState({
    account_id: "",
    amount: "",
    description: "",
    voucher_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [acc, vcs] = await Promise.all([
          api("/accounts"),
          api("/vouchers")
        ]);
        setAccounts(acc);
        setVouchers(vcs);
      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    }
    load();
  }, []);

  const expenseAccounts = accounts.filter((a) => a.category === "Expenses");

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
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
        const updated = await api(`/vouchers/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        setVouchers((prev) =>
          prev.map((v) => (v.id === editingId ? updated : v))
        );
        setViewVoucher((v) => (v?.id === editingId ? updated : v));
        showToast("success", "Voucher updated successfully.");
      } else {
        const created = await api("/vouchers", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setVouchers((prev) => [created, ...prev]);
        showToast("success", "Voucher created successfully.");
      }
      setForm({ account_id: "", amount: "", description: "", voucher_date: "" });
      setEditingId(null);
      setCreateOpen(false);
    } catch (e) {
      showToast("error", e.message || "Failed to save voucher");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(v) {
    setMenuOpenId(null);
    setEditingId(v.id);
    setForm({
      account_id: String(v.account_id ?? ""),
      amount: String(v.amount ?? ""),
      description: v.description || "",
      voucher_date: v.voucher_date || ""
    });
    setCreateOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ account_id: "", amount: "", description: "", voucher_date: "" });
    setCreateOpen(false);
  }

  async function handleDelete(v) {
    setMenuOpenId(null);
    if (!confirm(`Delete this voucher (${Number(v.amount).toFixed(2)} on ${v.voucher_date})?`)) return;
    setDeletingId(v.id);
    try {
      await api(`/vouchers/${v.id}`, { method: "DELETE" });
      setVouchers((prev) => prev.filter((x) => x.id !== v.id));
      if (viewVoucher?.id === v.id) setViewVoucher(null);
      showToast("success", "Voucher deleted.");
    } catch (e) {
      showToast("error", e.message || "Failed to delete voucher");
    } finally {
      setDeletingId(null);
    }
  }

  function handleView(v) {
    setMenuOpenId(null);
    setViewVoucher(v);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Expense Vouchers
        </h2>
        <Button onClick={() => setCreateOpen(true)}>Create voucher</Button>
      </div>

      <Modal open={createOpen} onClose={editingId ? cancelEdit : () => setCreateOpen(false)} title={editingId ? "Edit voucher" : "Create voucher"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="voucher_account_id">Expense account</label>
              <select
                id="voucher_account_id"
                value={form.account_id}
                onChange={(e) => updateForm("account_id", e.target.value)}
                className="w-full"
                required
              >
                <option value="">Select expense account</option>
                {expenseAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-1">
                <label htmlFor="voucher_date">Date</label>
                <input
                  type="date"
                  id="voucher_date"
                  value={form.voucher_date}
                  onChange={(e) => updateForm("voucher_date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="voucher_description">Description</label>
              <textarea
                id="voucher_description"
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
              {loading ? "Saving…" : editingId ? "Save changes" : "Create voucher"}
            </Button>
            <Button type="button" variant="ghost" onClick={editingId ? cancelEdit : () => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {viewVoucher && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Voucher details</h3>
            <button type="button" onClick={() => setViewVoucher(null)} className="text-xs text-slate-500 hover:underline">
              Close
            </button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Account</dt>
              <dd className="font-medium">{viewVoucher.account_name || viewVoucher.account_id}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Date</dt>
              <dd>{viewVoucher.voucher_date ? new Date(viewVoucher.voucher_date).toLocaleDateString() : "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd>{Number(viewVoucher.amount).toFixed(2)}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-slate-500">Description</dt>
              <dd className="text-slate-600">{viewVoucher.description || "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-visible">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{v.account_name || v.account_id}</td>
                <td className="px-3 py-2">
                  {v.voucher_date ? new Date(v.voucher_date).toLocaleDateString() : "-"}
                </td>
                <td className="px-3 py-2">{Number(v.amount).toFixed(2)}</td>
                <td className="px-3 py-2 text-xs text-slate-600">{v.description || "-"}</td>
                <td className="px-3 py-2">
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => setMenuOpenId(menuOpenId === v.id ? null : v.id)}
                      className="rounded p-1.5 bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-0 min-w-0"
                      aria-label="Actions"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {menuOpenId === v.id && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                          <button type="button" onClick={() => handleView(v)} className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0">View</button>
                          <button type="button" onClick={() => startEdit(v)} className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0">Edit</button>
                          <button type="button" onClick={() => handleDelete(v)} disabled={deletingId === v.id} className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 bg-transparent border-0">
                            {deletingId === v.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td className="px-3 py-4 text-center text-slate-500" colSpan={5}>
                  No vouchers yet. Create one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

