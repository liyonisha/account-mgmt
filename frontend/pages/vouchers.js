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
      const created = await api("/vouchers", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          account_id: Number(form.account_id)
        })
      });
      setVouchers((prev) => [created, ...prev]);
      setForm({
        account_id: "",
        amount: "",
        description: "",
        voucher_date: ""
      });
      setCreateOpen(false);
      showToast("success", "Voucher created successfully.");
    } catch (e) {
      showToast("error", e.message || "Failed to create voucher");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Expense Vouchers
        </h2>
        <Button onClick={() => setCreateOpen(true)}>Create voucher</Button>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create voucher">
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
              {loading ? "Saving…" : "Create voucher"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="px-3 py-2">
                  {v.account_name || v.account_id}
                </td>
                <td className="px-3 py-2">
                  {v.voucher_date
                    ? new Date(v.voucher_date).toLocaleDateString()
                    : "-"}
                </td>
                <td className="px-3 py-2">
                  {Number(v.amount).toFixed(2)}
                </td>
                <td className="px-3 py-2 text-xs text-slate-600">
                  {v.description || "-"}
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-slate-500"
                  colSpan={4}
                >
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

