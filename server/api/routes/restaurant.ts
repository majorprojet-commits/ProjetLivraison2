import { Router } from 'express';
import { RestaurantCtrl } from '../controllers/RestaurantCtrl.js';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { MongoRestaurantRepo } from '../../db/repos/MongoRestaurantRepo.js';

const router = Router();
const repo = new MongoRestaurantRepo();
const useCase = new GetRestaurants(repo);
const ctrl = new RestaurantCtrl(useCase);

router.get('/', ctrl.getAll);
export default router;
