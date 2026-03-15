import { query } from '../db.js';

export async function getIncomeStatement(type, year, month, toDate) {
  let startDate;
  let endDate;

  if (type === 'monthly') {
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    startDate = new Date(y, m - 1, 1);
    const lastDayOfMonth = new Date(y, m, 0);
    endDate = toDate ? new Date(toDate) : lastDayOfMonth;
  } else if (type === 'yearly') {
    const y = parseInt(year, 10);
    startDate = new Date(y, 0, 1);
    const lastDayOfYear = new Date(y, 11, 31);
    endDate = toDate ? new Date(toDate) : lastDayOfYear;
  } else {
    return null;
  }

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  const incomeRes = await query(
    `SELECT COALESCE(SUM(i.amount), 0) AS total_income
     FROM invoices i
     JOIN accounts a ON i.account_id = a.id
     WHERE a.category = 'Income'
       AND i.invoice_date BETWEEN $1 AND $2`,
    [startStr, endStr]
  );

  const expenseRes = await query(
    `SELECT COALESCE(SUM(v.amount), 0) AS total_expenses
     FROM vouchers v
     JOIN accounts a ON v.account_id = a.id
     WHERE a.category = 'Expenses'
       AND v.voucher_date BETWEEN $1 AND $2`,
    [startStr, endStr]
  );

  const totalIncome = Number(incomeRes.rows[0].total_income);
  const totalExpenses = Number(expenseRes.rows[0].total_expenses);
  const netProfit = totalIncome - totalExpenses;

  return {
    type,
    period: { startDate: startStr, endDate: endStr },
    totalIncome,
    totalExpenses,
    netProfit
  };
}
