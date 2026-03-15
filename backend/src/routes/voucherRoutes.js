import { Router } from 'express';
import * as voucherController from '../controllers/voucherController.js';

const router = Router();

router.get('/', voucherController.getVouchers);
router.post('/', voucherController.createVoucher);

export default router;
