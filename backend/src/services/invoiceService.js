import { query } from '../db.js';

export async function getAllInvoices() {
  const result = await query(
    `SELECT i.*, a.name as account_name, a.category as account_category
     FROM invoices i
     JOIN accounts a ON i.account_id = a.id
     ORDER BY i.id DESC`
  );
  return result.rows;
}

export async function createInvoice(data) {
  const { invoice_number, invoice_date, amount, description, account_id } = data;
  await query(
    `INSERT INTO invoices (invoice_number, invoice_date, amount, description, account_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [invoice_number, invoice_date, amount, description, account_id]
  );
  const created = await query(
    `SELECT i.*, a.name as account_name, a.category as account_category
     FROM invoices i
     JOIN accounts a ON i.account_id = a.id
     ORDER BY i.id DESC LIMIT 1`
  );
  return created.rows[0];
}
