import * as paymentService from '../services/paymentService.js';
import { validatePayment } from '../models/paymentModel.js';

export async function getPayments(req, res) {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
}

export async function recordPayment(req, res) {
  try {
    const invoiceId = parseInt(req.params.id, 10);
    const validation = validatePayment(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const result = await paymentService.recordPayment(
      invoiceId,
      validation.data.amount,
      validation.data.payment_date
    );
    if (!result) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(201).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to record payment: ${err.message}` });
  }
}
