import { Router } from 'express';
import * as SellerCtrl from '../controllers/SellerCtrl.js';

const router = Router();

router.get('/', SellerCtrl.getSellers);
router.post('/', SellerCtrl.createSeller);
router.patch('/:id/status', SellerCtrl.updateSellerStatus);

export default router;
