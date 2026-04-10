import { Router } from 'express';
import { UserCtrl } from '../controllers/UserCtrl.js';
import { GetUser } from '../../usecases/GetUser.js';
import { UpdateUser } from '../../usecases/UpdateUser.js';
import { GetUsers } from '../../usecases/GetUsers.js';
import { UpdateUserRole } from '../../usecases/UpdateUserRole.js';
import { MongoUserRepo } from '../../db/repos/MongoUserRepo.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoUserRepo();
const getUseCase = new GetUser(repo);
const updateUseCase = new UpdateUser(repo);
const getUsersUseCase = new GetUsers(repo);
const updateUserRoleUseCase = new UpdateUserRole(repo);
const ctrl = new UserCtrl(getUseCase, updateUseCase, getUsersUseCase, updateUserRoleUseCase);

router.get('/me', authMiddleware, ctrl.getProfile);
router.put('/me', authMiddleware, ctrl.updateProfile);
router.put('/me/promote', authMiddleware, ctrl.promoteToAdmin);
router.get('/', authMiddleware, roleMiddleware(['admin']), ctrl.getAll);
router.put('/:id/role', authMiddleware, roleMiddleware(['admin']), ctrl.updateRole);
export default router;
