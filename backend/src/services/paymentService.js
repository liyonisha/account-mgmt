import { query } from '../db.js';

export async function getAllPayments() {
  const result = await query(
    `SELECT p.*, i.invoice_number, i.amount as invoice_amount, i.status as invoice_status
     FROM payments p
     JOIN invoices i ON p.invoice_id = i.id
     ORDER BY p.id DESC`
  );
  return result.rows;
}

export async function recordPayment(invoiceId, amount, payment_date) {
  const paymentRes = await query(
    `INSERT INTO payments (invoice_id, amount, payment_date)
     VALUES ($1, $2, $3) RETURNING *`,
    [invoiceId, amount, payment_date]
  );

  const invoiceRes = await query(
    'SELECT amount FROM invoices WHERE id = $1',
    [invoiceId]
  );
  if (invoiceRes.rows.length === 0) {
    return null;
  }
  const invoiceAmount = Number(invoiceRes.rows[0].amount);

  const totalRes = await query(
    'SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE invoice_id = $1',
    [invoiceId]
  );
  const totalPaid = Number(totalRes.rows[0].total);
  const status = totalPaid >= invoiceAmount ? 'Paid' : 'Unpaid';

  await query('UPDATE invoices SET status = $1 WHERE id = $2', [status, invoiceId]);

  return { payment: paymentRes.rows[0], invoice_status: status };
}
