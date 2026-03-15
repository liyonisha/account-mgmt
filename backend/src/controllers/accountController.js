import * as accountService from '../services/accountService.js';
import { validateAccount } from '../models/accountModel.js';

export async function getAccounts(req, res) {
  try {
    const accounts = await accountService.getAllAccounts();
    res.json(accounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch accounts' });
  }
}

export async function createAccount(req, res) {
  try {
    const validation = validateAccount(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const account = await accountService.createAccount(
      validation.data.name,
      validation.data.category
    );
    res.status(201).json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to create account: ${err.message}` });
  }
}

export async function updateAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const validation = validateAccount(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const account = await accountService.updateAccount(
      id,
      validation.data.name,
      validation.data.category
    );
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to update account: ${err.message}` });
  }
}

export async function deleteAccount(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const usage = await accountService.getAccountUsage(id);
    const totalUsage = usage.invoices + usage.vouchers;
    if (totalUsage > 0) {
      return res.status(400).json({
        message: 'Cannot delete account: it is used by ' +
          (usage.invoices ? `${usage.invoices} invoice(s)` : '') +
          (usage.invoices && usage.vouchers ? ' and ' : '') +
          (usage.vouchers ? `${usage.vouchers} voucher(s)` : '') +
          '. Remove or reassign them first.'
      });
    }
    const deleted = await accountService.deleteAccount(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.status(200).json({ message: 'Account deleted' });
  } catch (err) {
    console.error(err);
    if (err.code === '23503') {
      return res.status(400).json({
        message: 'Cannot delete account: it is used by invoices or vouchers.'
      });
    }
    res.status(500).json({ message: `Failed to delete account: ${err.message}` });
  }
}
