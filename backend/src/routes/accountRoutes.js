import { Router } from 'express';
import * as accountController from '../controllers/accountController.js';

const router = Router();

router.get('/', accountController.getAccounts);
router.post('/', accountController.createAccount);
router.put('/:id', accountController.updateAccount);
router.delete('/:id', accountController.deleteAccount);

export default router;
