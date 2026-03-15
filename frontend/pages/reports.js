import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";
import Button from "../components/Button";
import Modal from "../components/Modal";

const STORAGE_KEY = "incomeStatementReport";

function loadSavedReport() {
  try {
    const raw = typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { result } = JSON.parse(raw);
    return result && result.period ? result : null;
  } catch {
    return null;
  }
}

function saveReport(result) {
  try {
    if (typeof window !== "undefined" && result) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        result,
        generatedAt: new Date().toISOString()
      }));
    }
  } catch (_) {}
}

export default function ReportsPage() {
  const [type, setType] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [toDate, setToDate] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const saved = loadSavedReport();
    if (saved) setResult(saved);
  }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("type", type);
      params.set("year", year);
      if (type === "monthly") {
        params.set("month", month);
      }
      if (toDate) {
        params.set("toDate", toDate);
      }
      const data = await api(`/reports/income-statement?${params.toString()}`);
      setResult(data);
      saveReport(data);
      setFormOpen(false);
      showToast("success", "Income statement generated.");
    } catch (e) {
      showToast("error", e.message || "Failed to generate report");
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Income Statement
        </h2>
        <Button onClick={() => setFormOpen(true)}>Generate income statement</Button>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Generate income statement">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label htmlFor="report_type">Report type</label>
              <select
                id="report_type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="report_year">Year</label>
              <input
                id="report_year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full"
                required
              />
            </div>
            {type === "monthly" && (
              <div className="space-y-1">
                <label htmlFor="report_month">Month</label>
                <select
                  id="report_month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full"
                >
                  {Array.from({ length: 12 }).map((_, idx) => {
                    const m = String(idx + 1).padStart(2, "0");
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            <div className="space-y-1">
              <label htmlFor="report_toDate">Up to date (optional)</label>
              <input
                type="date"
                id="report_toDate"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Generating…" : "Generate report"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {result && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <h3 className="font-semibold text-slate-900">Summary</h3>
          <p className="text-sm text-slate-600">
            Period: {result.period.startDate} to {result.period.endDate}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-slate-500">Total Income</div>
              <div className="text-lg font-semibold text-emerald-700">
                {result.totalIncome.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Total Expenses</div>
              <div className="text-lg font-semibold text-rose-700">
                {result.totalExpenses.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-slate-500">Net Profit / Loss</div>
              <div
                className={`text-lg font-semibold ${
                  result.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                {result.netProfit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

