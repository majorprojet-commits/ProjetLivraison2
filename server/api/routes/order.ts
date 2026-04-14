import { Router } from 'express';
import { OrderCtrl } from '../controllers/OrderCtrl.js';
import { CreateOrder } from '../../usecases/CreateOrder.js';
import { GetOrders } from '../../usecases/GetOrders.js';
import { GetSellerOrders } from '../../usecases/GetSellerOrders.js';
import { UpdateOrderStatus } from '../../usecases/UpdateOrderStatus.js';
import { GetAvailableOrders } from '../../usecases/GetAvailableOrders.js';
import { GetDriverOrders } from '../../usecases/GetDriverOrders.js';
import { AssignDriver } from '../../usecases/AssignDriver.js';
import { MongoOrderRepo } from '../../db/repos/MongoOrderRepo.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const repo = new MongoOrderRepo();
const createUseCase = new CreateOrder(repo);
const getUseCase = new GetOrders(repo);
const getSellerOrdersUseCase = new GetSellerOrders(repo);
const updateOrderStatusUseCase = new UpdateOrderStatus(repo);
const getAvailableOrdersUseCase = new GetAvailableOrders(repo);
const getDriverOrdersUseCase = new GetDriverOrders(repo);
const assignDriverUseCase = new AssignDriver(repo);
const ctrl = new OrderCtrl(
  createUseCase, 
  getUseCase, 
  getSellerOrdersUseCase, 
  updateOrderStatusUseCase,
  getAvailableOrdersUseCase,
  getDriverOrdersUseCase,
  assignDriverUseCase
);

router.post('/', authMiddleware, ctrl.create);
router.get('/', authMiddleware, ctrl.getAll);
router.get('/available', authMiddleware, ctrl.getAvailable);
router.get('/driver', authMiddleware, ctrl.getForDriver);
router.get('/seller/:sellerId', authMiddleware, ctrl.getForSeller);
router.put('/:id/status', authMiddleware, ctrl.updateStatus);
router.put('/:id/assign', authMiddleware, ctrl.assignToDriver);
export default router;
