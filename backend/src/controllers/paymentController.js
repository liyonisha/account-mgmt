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

export async function getPayment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payment' });
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

export async function updatePayment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await paymentService.getPaymentById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const validation = validatePayment(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const payment = await paymentService.updatePayment(
      id,
      validation.data.amount,
      validation.data.payment_date
    );
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to update payment: ${err.message}` });
  }
}

export async function deletePayment(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await paymentService.getPaymentById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await paymentService.deletePayment(id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Failed to delete payment: ${err.message}` });
  }
}
