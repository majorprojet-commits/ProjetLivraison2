import { Router } from 'express';
import { RestaurantCtrl } from '../controllers/RestaurantCtrl.js';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { MongoRestaurantRepo } from '../../db/repos/MongoRestaurantRepo.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoRestaurantRepo();
const useCase = new GetRestaurants(repo);
const ctrl = new RestaurantCtrl(useCase);

router.get('/', authMiddleware, roleMiddleware(['admin']), ctrl.getAll);
export default router;
