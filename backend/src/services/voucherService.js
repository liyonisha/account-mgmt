import { query } from '../db.js';

export async function getAllVouchers() {
  const result = await query(
    `SELECT v.*, a.name as account_name
     FROM vouchers v
     JOIN accounts a ON v.account_id = a.id
     ORDER BY v.id DESC`
  );
  return result.rows;
}

export async function getVoucherById(id) {
  const result = await query(
    `SELECT v.*, a.name as account_name
     FROM vouchers v
     JOIN accounts a ON v.account_id = a.id
     WHERE v.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createVoucher(data) {
  const { account_id, amount, description, voucher_date } = data;
  const result = await query(
    `INSERT INTO vouchers (account_id, amount, description, voucher_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [account_id, amount, description, voucher_date]
  );
  const row = result.rows[0];
  const withAccount = await query(
    `SELECT v.*, a.name as account_name FROM vouchers v JOIN accounts a ON v.account_id = a.id WHERE v.id = $1`,
    [row.id]
  );
  return withAccount.rows[0];
}

export async function updateVoucher(id, data) {
  const { account_id, amount, description, voucher_date } = data;
  await query(
    `UPDATE vouchers SET account_id = $1, amount = $2, description = $3, voucher_date = $4 WHERE id = $5`,
    [account_id, amount, description, voucher_date, id]
  );
  return getVoucherById(id);
}

export async function deleteVoucher(id) {
  await query('DELETE FROM vouchers WHERE id = $1', [id]);
  return true;
}
