import { Router } from 'express';
import { SellerCtrl } from '../controllers/SellerCtrl.js';
import { GetSellers } from '../../usecases/GetSellers.js';
import { GetSellerMenu } from '../../usecases/GetSellerMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { UpdateDish } from '../../usecases/UpdateDish.js';
import { DeleteDish } from '../../usecases/DeleteDish.js';
import { UpdateSellerSettings } from '../../usecases/UpdateSellerSettings.js';
import { MongoSellerRepo } from '../../db/repos/MongoSellerRepo.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoSellerRepo();
const getSellers = new GetSellers(repo);
const getMenu = new GetSellerMenu(repo);
const addDish = new AddDishToMenu(repo);
const updateDishAvailability = new UpdateDishAvailability(repo);
const updateDish = new UpdateDish(repo);
const deleteDish = new DeleteDish(repo);
const updateSettings = new UpdateSellerSettings(repo);
const ctrl = new SellerCtrl(getSellers, getMenu, addDish, updateDishAvailability, updateDish, deleteDish, updateSettings);

router.get('/', ctrl.getAll);
router.get('/:id/menu', ctrl.getMenu);
router.post('/:id/menu', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.addDish);
router.put('/:id/menu/:dishId/availability', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateDishAvailability);
router.put('/:id/menu/:dishId', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateDish);
router.delete('/:id/menu/:dishId', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.deleteDish);
router.put('/:id/settings', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateSettings);

export default router;
