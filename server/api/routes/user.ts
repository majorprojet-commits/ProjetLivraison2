import { Router } from 'express';
import { UserCtrl } from '../controllers/UserCtrl.js';
import { GetUser } from '../../usecases/GetUser.js';
import { UpdateUser } from '../../usecases/UpdateUser.js';
import { MongoUserRepo } from '../../db/repos/MongoUserRepo.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoUserRepo();
const getUseCase = new GetUser(repo);
const updateUseCase = new UpdateUser(repo);
const ctrl = new UserCtrl(getUseCase, updateUseCase);

router.get('/me', authMiddleware, ctrl.getProfile);
router.put('/me', authMiddleware, ctrl.updateProfile);
export default router;
