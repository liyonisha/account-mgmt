import * as invoiceService from '../services/invoiceService.js';
import { validateInvoice } from '../models/invoiceModel.js';

export async function getInvoices(req, res) {
  try {
    const invoices = await invoiceService.getAllInvoices();
    res.json(invoices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoices' });
  }
}

export async function createInvoice(req, res) {
  try {
    const validation = validateInvoice(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const invoice = await invoiceService.createInvoice(validation.data);
    res.status(201).json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to create invoice: ${err.message}` });
  }
}
