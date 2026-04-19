import { Router } from 'express';
import { PaymentCtrl } from '../controllers/PaymentCtrl.js';
import { InitializePayUnitPayment } from '../../usecases/InitializePayUnitPayment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const initializeUseCase = new InitializePayUnitPayment();
const ctrl = new PaymentCtrl(initializeUseCase);

router.post('/payunit/initialize', authMiddleware, ctrl.initialize);
router.post('/payunit/webhook', ctrl.webhook);

export default router;
