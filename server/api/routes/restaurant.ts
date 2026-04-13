import { Router } from 'express';
import { RestaurantCtrl } from '../controllers/RestaurantCtrl.js';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { GetRestaurantMenu } from '../../usecases/GetRestaurantMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { UpdateDish } from '../../usecases/UpdateDish.js';
import { DeleteDish } from '../../usecases/DeleteDish.js';
import { UpdateRestaurantSettings } from '../../usecases/UpdateRestaurantSettings.js';
import { MongoRestaurantRepo } from '../../db/repos/MongoRestaurantRepo.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoRestaurantRepo();
const getRestaurants = new GetRestaurants(repo);
const getMenu = new GetRestaurantMenu(repo);
const addDish = new AddDishToMenu(repo);
const updateDishAvailability = new UpdateDishAvailability(repo);
const updateDish = new UpdateDish(repo);
const deleteDish = new DeleteDish(repo);
const updateSettings = new UpdateRestaurantSettings(repo);
const ctrl = new RestaurantCtrl(getRestaurants, getMenu, addDish, updateDishAvailability, updateDish, deleteDish, updateSettings);

router.get('/', ctrl.getAll);
router.get('/:id/menu', ctrl.getMenu);
router.post('/:id/menu', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.addDish);
router.put('/:id/menu/:dishId/availability', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.updateDishAvailability);
router.put('/:id/menu/:dishId', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.updateDish);
router.delete('/:id/menu/:dishId', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.deleteDish);
router.put('/:id/settings', authMiddleware, roleMiddleware(['restaurant', 'admin']), ctrl.updateSettings);

export default router;
