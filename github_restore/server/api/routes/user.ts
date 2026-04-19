import { Router } from 'express';
import { UserCtrl } from '../controllers/UserCtrl.ts';
import { GetUser } from '../../usecases/GetUser.ts';
import { UpdateUser } from '../../usecases/UpdateUser.ts';
import { GetUsers } from '../../usecases/GetUsers.ts';
import { UpdateUserRole } from '../../usecases/UpdateUserRole.ts';
import { MongoUserRepo } from '../../db/repos/MongoUserRepo.ts';
import { authMiddleware, roleMiddleware } from '../middleware/auth.ts';

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
