import { Router } from 'express';
import { AuthCtrl } from '../controllers/AuthCtrl.js';
import { RegisterUser } from '../../usecases/RegisterUser.js';
import { LoginUser } from '../../usecases/LoginUser.js';
import { MongoUserRepo } from '../../db/repos/MongoUserRepo.js';

const router = Router();
const repo = new MongoUserRepo();
const registerUseCase = new RegisterUser(repo);
const loginUseCase = new LoginUser(repo);
const ctrl = new AuthCtrl(registerUseCase, loginUseCase);

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
export default router;
