import { Router } from 'express';
import { OrderCtrl } from '../controllers/OrderCtrl.js';
import { CreateOrder } from '../../usecases/CreateOrder.js';
import { GetOrders } from '../../usecases/GetOrders.js';
import { GetRestaurantOrders } from '../../usecases/GetRestaurantOrders.js';
import { UpdateOrderStatus } from '../../usecases/UpdateOrderStatus.js';
import { MongoOrderRepo } from '../../db/repos/MongoOrderRepo.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoOrderRepo();
const createUseCase = new CreateOrder(repo);
const getUseCase = new GetOrders(repo);
const getRestaurantOrdersUseCase = new GetRestaurantOrders(repo);
const updateOrderStatusUseCase = new UpdateOrderStatus(repo);
const ctrl = new OrderCtrl(createUseCase, getUseCase, getRestaurantOrdersUseCase, updateOrderStatusUseCase);

router.post('/', authMiddleware, ctrl.create);
router.get('/', authMiddleware, ctrl.getAll);
router.get('/restaurant/:restaurantId', authMiddleware, ctrl.getForRestaurant);
router.put('/:id/status', authMiddleware, ctrl.updateStatus);
export default router;
