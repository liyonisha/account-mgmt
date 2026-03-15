import * as voucherService from '../services/voucherService.js';
import { validateVoucher } from '../models/voucherModel.js';

export async function getVouchers(req, res) {
  try {
    const vouchers = await voucherService.getAllVouchers();
    res.json(vouchers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch vouchers' });
  }
}

export async function createVoucher(req, res) {
  try {
    const validation = validateVoucher(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const voucher = await voucherService.createVoucher(validation.data);
    res.status(201).json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to create voucher: ${err.message}` });
  }
}
