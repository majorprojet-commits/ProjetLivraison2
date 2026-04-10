import { Router } from 'express';
import { RestaurantCtrl } from '../controllers/RestaurantCtrl.js';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { GetRestaurantMenu } from '../../usecases/GetRestaurantMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { MongoRestaurantRepo } from '../../db/repos/MongoRestaurantRepo.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoRestaurantRepo();
const getRestaurants = new GetRestaurants(repo);
const getMenu = new GetRestaurantMenu(repo);
const addDish = new AddDishToMenu(repo);
const updateDish = new UpdateDishAvailability(repo);
const ctrl = new RestaurantCtrl(getRestaurants, getMenu, addDish, updateDish);

router.get('/', authMiddleware, roleMiddleware(['admin']), ctrl.getAll);
router.get('/:id/menu', authMiddleware, ctrl.getMenu);
router.post('/:id/menu', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.addDish);
router.put('/:id/menu/:dishId', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.updateDishAvailability);

export default router;
