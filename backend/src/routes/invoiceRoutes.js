import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.createInvoice);
router.post('/:id/payments', paymentController.recordPayment);

export default router;
