import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController.js';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoice);
router.post('/', invoiceController.createInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);
router.post('/:id/payments', paymentController.recordPayment);

export default router;
