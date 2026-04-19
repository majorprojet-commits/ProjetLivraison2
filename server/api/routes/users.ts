import { Router } from 'express';
import * as UserCtrl from '../controllers/UserCtrl.js';

const router = Router();

router.get('/', UserCtrl.getUsers);
router.patch('/:id/ban', UserCtrl.banUser);

export default router;
