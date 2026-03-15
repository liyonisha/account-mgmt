import { Router } from 'express';
import * as voucherController from '../controllers/voucherController.js';

const router = Router();

router.get('/', voucherController.getVouchers);
router.get('/:id', voucherController.getVoucher);
router.post('/', voucherController.createVoucher);
router.put('/:id', voucherController.updateVoucher);
router.delete('/:id', voucherController.deleteVoucher);

export default router;
