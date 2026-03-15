import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Home() {
  const [summary, setSummary] = useState({
    accounts: 0,
    invoices: 0,
    payments: 0,
    vouchers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [accounts, invoices, payments, vouchers] = await Promise.all([
          api("/accounts"),
          api("/invoices"),
          api("/payments"),
          api("/vouchers")
        ]);
        setSummary({
          accounts: accounts.length,
          invoices: invoices.length,
          payments: payments.length,
          vouchers: vouchers.length
        });
      } catch (e) {
        setError("Could not load latest data. You can still use the navigation above.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">
          Admin Dashboard
        </h2>
        <p className="text-slate-700">
          Quick overview of your accounts, invoices, payments and income
          statements. Use the cards below or the navigation bar to jump
          directly to a section.
        </p>
        {error && (
          <p className="text-xs text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/accounts"
          className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Chart of Accounts</h3>
            <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              {loading ? "…" : `${summary.accounts} total`}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Create and manage Income, Expense, Asset, Liability and Equity
            accounts.
          </p>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 group-hover:underline">
            Go to accounts →
          </span>
        </Link>

        <Link
          href="/invoices"
          className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Invoices</h3>
            <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              {loading ? "…" : `${summary.invoices} invoices`}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Create invoices and assign them to income accounts.
          </p>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 group-hover:underline">
            Manage invoices →
          </span>
        </Link>

        <Link
          href="/payments"
          className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Payments</h3>
            <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              {loading ? "…" : `${summary.payments} recorded`}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Record payments for invoices and mark them as Paid or Unpaid.
          </p>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 group-hover:underline">
            Record payments →
          </span>
        </Link>

        <Link
          href="/reports"
          className="group block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-900">Income Statement</h3>
            <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
              {loading ? "…" : `${summary.vouchers} vouchers`}
            </span>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            Generate monthly and yearly income statements up to any date.
          </p>
          <span className="text-xs font-medium text-indigo-600 group-hover:text-indigo-700 group-hover:underline">
            View reports →
          </span>
        </Link>
      </div>
    </div>
  );
}

