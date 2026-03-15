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

export async function deleteAccount(id) {
  const result = await query('DELETE FROM accounts WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}
