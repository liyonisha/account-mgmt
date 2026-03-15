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

export async function getInvoice(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invoice' });
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

export async function updateInvoice(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await invoiceService.getInvoiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    const validation = validateInvoice(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const invoice = await invoiceService.updateInvoice(id, validation.data);
    res.json(invoice);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to update invoice: ${err.message}` });
  }
}

export async function deleteInvoice(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await invoiceService.getInvoiceById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    await invoiceService.deleteInvoice(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to delete invoice: ${err.message}` });
  }
}
