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

export async function getVoucher(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const voucher = await voucherService.getVoucherById(id);
    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    res.json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch voucher' });
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

export async function updateVoucher(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await voucherService.getVoucherById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    const validation = validateVoucher(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const voucher = await voucherService.updateVoucher(id, validation.data);
    res.json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to update voucher: ${err.message}` });
  }
}

export async function deleteVoucher(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await voucherService.getVoucherById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Voucher not found' });
    }
    await voucherService.deleteVoucher(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to delete voucher: ${err.message}` });
  }
}
