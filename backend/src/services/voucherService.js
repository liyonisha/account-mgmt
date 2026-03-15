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

export async function createVoucher(data) {
  const { account_id, amount, description, voucher_date } = data;
  const result = await query(
    `INSERT INTO vouchers (account_id, amount, description, voucher_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [account_id, amount, description, voucher_date]
  );
  return result.rows[0];
}
