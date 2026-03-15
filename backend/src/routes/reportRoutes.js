import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';

const router = Router();

router.get('/income-statement', reportController.getIncomeStatement);

export default router;
