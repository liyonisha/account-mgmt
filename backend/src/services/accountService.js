import { query } from '../db.js';

export async function getAllAccounts() {
  const result = await query('SELECT * FROM accounts ORDER BY id DESC');
  return result.rows;
}

export async function createAccount(name, category) {
  const result = await query(
    'INSERT INTO accounts (name, category) VALUES ($1, $2) RETURNING *',
    [name, category]
  );
  return result.rows[0];
}

export async function updateAccount(id, name, category) {
  const result = await query(
    'UPDATE accounts SET name = $1, category = $2 WHERE id = $3 RETURNING *',
    [name, category, id]
  );
  return result.rows[0];
}

export async function getAccountUsage(id) {
  const [inv, vouch] = await Promise.all([
    query('SELECT COUNT(*) AS n FROM invoices WHERE account_id = $1', [id]),
    query('SELECT COUNT(*) AS n FROM vouchers WHERE account_id = $1', [id])
  ]);
  return {
    invoices: parseInt(inv.rows[0].n, 10),
    vouchers: parseInt(vouch.rows[0].n, 10)
  };
}

export async function deleteAccount(id) {
  const result = await query('DELETE FROM accounts WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}
