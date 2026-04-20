import { Router } from 'express';
import { SellerCtrl } from '../controllers/SellerCtrl.ts';
import { GetSellers } from '../../usecases/GetSellers.ts';
import { GetSellerMenu } from '../../usecases/GetSellerMenu.ts';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.ts';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.ts';
import { UpdateDish } from '../../usecases/UpdateDish.ts';
import { DeleteDish } from '../../usecases/DeleteDish.ts';
import { UpdateSellerSettings } from '../../usecases/UpdateSellerSettings.ts';
import { MongoSellerRepo } from '../../db/repos/MongoSellerRepo.ts';
import { authMiddleware, roleMiddleware } from '../middleware/auth.ts';

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
router.post('/', authMiddleware, roleMiddleware(['admin']), ctrl.create);
router.get('/:id/menu', ctrl.getMenu);
router.post('/:id/menu', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.addDish);
router.put('/:id/menu/:dishId/availability', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateDishAvailability);
router.put('/:id/menu/:dishId', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateDish);
router.delete('/:id/menu/:dishId', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.deleteDish);
router.put('/:id/settings', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateSettings);
router.put('/:id/pause', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.togglePause);
router.put('/:id/hours', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.updateOpeningHours);
router.get('/:id/payouts', authMiddleware, roleMiddleware(['seller', 'admin']), ctrl.getPayouts);

export default router;
