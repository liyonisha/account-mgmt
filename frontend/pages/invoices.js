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
      const created = await api("/invoices", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setInvoices((prev) => [created, ...prev]);
      setForm({
        invoice_number: "",
        invoice_date: "",
        amount: "",
        description: "",
        account_id: ""
      });
      setCreateOpen(false);
      showToast("success", `Invoice "${created.invoice_number}" created successfully.`);
    } catch (e) {
      showToast("error", e.message || "Failed to create invoice");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Invoices
        </h2>
        <Button onClick={() => setCreateOpen(true)}>Create invoice</Button>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create invoice">
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
              {loading ? "Saving…" : "Create invoice"}
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
              <th className="px-3 py-2 text-left">Invoice</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Account</th>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Amount</th>
              <th className="px-3 py-2 text-left">Status</th>
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
                    {inv.invoice_date
                      ? new Date(inv.invoice_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {Number(inv.amount).toFixed(2)}
                  </td>
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
                </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td
                  className="px-3 py-4 text-center text-slate-500"
                  colSpan={6}
                >
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

