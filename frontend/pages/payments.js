import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Button from "../components/Button";
import Modal from "../components/Modal";

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({
    invoice_id: "",
    amount: "",
    payment_date: ""
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  async function loadData() {
    setListLoading(true);
    try {
      const [inv, pay] = await Promise.all([
        api("/invoices"),
        api("/payments")
      ]);
      setInvoices(inv);
      setPayments(pay);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRecordPayment(e) {
    e.preventDefault();
    setError("");
    if (!form.invoice_id || !form.amount || !form.payment_date) {
      setError("Please select an invoice and enter amount and date.");
      return;
    }
    setLoading(true);
    try {
      const result = await api(`/invoices/${form.invoice_id}/payments`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(form.amount),
          payment_date: form.payment_date
        })
      });
      const invoice = invoices.find((i) => i.id === Number(form.invoice_id));
      setPayments((prev) => [
        {
          id: result.payment.id,
          invoice_id: result.payment.invoice_id,
          amount: result.payment.amount,
          payment_date: result.payment.payment_date,
          created_at: result.payment.created_at,
          invoice_number: invoice?.invoice_number,
          invoice_amount: invoice?.amount,
          invoice_status: result.invoice_status
        },
        ...prev
      ]);
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === Number(form.invoice_id)
            ? { ...inv, status: result.invoice_status }
            : inv
        )
      );
      setForm({ invoice_id: "", amount: "", payment_date: "" });
      setCreateOpen(false);
      showToast("success", "Payment recorded. Invoice marked as " + result.invoice_status + ".");
    } catch (e) {
      showToast("error", e.message || "Failed to record payment");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Payment Recording
        </h2>
        <Button onClick={() => setCreateOpen(true)}>Record payment</Button>
      </div>

      <p className="text-slate-600 text-sm">
        Record payments against invoices. Invoices are marked as Paid when total
        payments reach the invoice amount.
      </p>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Record payment">
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="payment_invoice_id">Invoice</label>
              <select
                id="payment_invoice_id"
                value={form.invoice_id}
                onChange={(e) => updateForm("invoice_id", e.target.value)}
                className="w-full"
                required
              >
                <option value="">Select invoice</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — {Number(inv.amount).toFixed(2)} ({inv.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="payment_amount">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  id="payment_amount"
                  value={form.amount}
                  onChange={(e) => updateForm("amount", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="payment_date">Payment date</label>
                <input
                  type="date"
                  id="payment_date"
                  value={form.payment_date}
                  onChange={(e) => updateForm("payment_date", e.target.value)}
                  className="w-full"
                  required
                />
              </div>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Record payment"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <div className="rounded-lg border border-slate-200 bg-white overflow-visible shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Invoice</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Payment date</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Invoice status</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Recorded at</th>
            </tr>
          </thead>
          <tbody>
            {listLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Loading payments…
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  No payments yet. Record a payment above.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.invoice_number}</td>
                  <td className="px-4 py-3">{Number(p.amount).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    {p.payment_date
                      ? new Date(p.payment_date).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        p.invoice_status === "Paid"
                          ? "inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                          : "inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {p.invoice_status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
