import { Router } from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = Router();

router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

export default router;
