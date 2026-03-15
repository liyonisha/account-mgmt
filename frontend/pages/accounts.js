import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Button from "../components/Button";
import Modal from "../components/Modal";

const CATEGORIES = ["Income", "Expenses", "Assets", "Liabilities", "Equity"];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Income");
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewAccount, setViewAccount] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const { showToast } = useToast();

  async function loadAccounts() {
    setTableLoading(true);
    try {
      const data = await api("/accounts");
      setAccounts(data);
      setError("");
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setTableLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (editingId) {
        const updated = await api(`/accounts/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({ name, category })
        });
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === editingId ? updated : acc))
        );
        showToast("success", `Account "${updated.name}" updated successfully.`);
      } else {
        const newAccount = await api("/accounts", {
          method: "POST",
          body: JSON.stringify({ name, category })
        });
        setAccounts((prev) => [newAccount, ...prev]);
        showToast(
          "success",
          `Account "${newAccount.name}" created successfully.`
        );
      }
      setName("");
      setCategory("Income");
      setEditingId(null);
      setCreateOpen(false);
    } catch (e) {
      showToast("error", e.message || "Failed to save account");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(account) {
    setMenuOpenId(null);
    setEditingId(account.id);
    setName(account.name);
    setCategory(account.category);
    setCreateOpen(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setName("");
    setCategory("Income");
    setCreateOpen(false);
  }

  async function handleDelete(account) {
    setMenuOpenId(null);
    if (!confirm(`Delete account "${account.name}"? This will fail if it is used by any invoice or voucher.`)) return;
    setDeletingId(account.id);
    try {
      await api(`/accounts/${account.id}`, { method: "DELETE" });
      setAccounts((prev) => prev.filter((acc) => acc.id !== account.id));
      showToast("success", `Account "${account.name}" deleted.`);
      if (viewAccount?.id === account.id) setViewAccount(null);
    } catch (e) {
      showToast("error", e.message || "Failed to delete account");
    } finally {
      setDeletingId(null);
    }
  }

  function handleView(account) {
    setMenuOpenId(null);
    setViewAccount(account);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Chart of Accounts
        </h2>
        <Button onClick={() => { setEditingId(null); setName(""); setCategory("Income"); setCreateOpen(true); }}>
          Create account
        </Button>
      </div>

      <Modal open={createOpen} onClose={editingId ? cancelEdit : () => setCreateOpen(false)} title={editingId ? "Edit account" : "Create account"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="account-name">Account name</label>
              <input
                id="account-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                placeholder="e.g. Sales, Rent"
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="account-category">Category</label>
              <select
                id="account-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : editingId ? "Save changes" : "Create account"}
            </Button>
            <Button type="button" variant="ghost" onClick={editingId ? cancelEdit : () => setCreateOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {viewAccount && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Account details</h3>
            <button
              type="button"
              onClick={() => setViewAccount(null)}
              className="text-xs text-slate-500 hover:underline"
            >
              Close
            </button>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-slate-500">Name</dt>
              <dd className="font-medium">{viewAccount.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {viewAccount.category}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Created at</dt>
              <dd className="text-xs text-slate-600">
                {viewAccount.created_at
                  ? new Date(viewAccount.created_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">ID</dt>
              <dd className="text-xs text-slate-600">{viewAccount.id}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white overflow-visible shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Category
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Created at
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tableLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  Loading accounts…
                </td>
              </tr>
            ) : (
              accounts.map((acc) => (
                <tr
                  key={acc.id}
                  className="border-t border-slate-100 transition-colors hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium">{acc.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                      {acc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {acc.created_at
                      ? new Date(acc.created_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="relative inline-block">
                      <button
                        type="button"
                        onClick={() => setMenuOpenId(menuOpenId === acc.id ? null : acc.id)}
                        className="rounded p-1.5 bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700 border-0 shadow-none min-w-0"
                        aria-label="Actions"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <circle cx="12" cy="5" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="19" r="1.5" />
                        </svg>
                      </button>
                      {menuOpenId === acc.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            aria-hidden="true"
                            onClick={() => setMenuOpenId(null)}
                          />
                          <div className="absolute right-0 top-full z-20 mt-1 min-w-[120px] rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                            <button
                              type="button"
                              onClick={() => handleView(acc)}
                              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0 shadow-none"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => startEdit(acc)}
                              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 bg-transparent border-0 shadow-none"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(acc)}
                              disabled={deletingId === acc.id}
                              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 bg-transparent border-0 shadow-none"
                            >
                              {deletingId === acc.id ? "Deleting…" : "Delete"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            {!tableLoading && accounts.length === 0 && (
              <tr>
                <td
                  className="px-4 py-8 text-center text-slate-500"
                  colSpan={4}
                >
                  No accounts yet. Create your first account above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

