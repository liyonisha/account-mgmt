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

export async function getInvoiceById(id) {
  const result = await query(
    `SELECT i.*, a.name as account_name, a.category as account_category
     FROM invoices i
     JOIN accounts a ON i.account_id = a.id
     WHERE i.id = $1`,
    [id]
  );
  return result.rows[0] || null;
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

export async function updateInvoice(id, data) {
  const { invoice_number, invoice_date, amount, description, account_id } = data;
  await query(
    `UPDATE invoices SET invoice_number = $1, invoice_date = $2, amount = $3, description = $4, account_id = $5
     WHERE id = $6`,
    [invoice_number, invoice_date, amount, description, account_id, id]
  );
  return getInvoiceById(id);
}

export async function deleteInvoice(id) {
  await query('DELETE FROM payments WHERE invoice_id = $1', [id]);
  await query('DELETE FROM invoices WHERE id = $1', [id]);
  return true;
}
