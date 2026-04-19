import { Router } from 'express';
import { OrderCtrl } from '../controllers/OrderCtrl.ts';
import { CreateOrder } from '../../usecases/CreateOrder.ts';
import { GetOrders } from '../../usecases/GetOrders.ts';
import { GetAllOrders } from '../../usecases/GetAllOrders.ts';
import { GetSellerOrders } from '../../usecases/GetSellerOrders.ts';
import { UpdateOrderStatus } from '../../usecases/UpdateOrderStatus.ts';
import { GetAvailableOrders } from '../../usecases/GetAvailableOrders.ts';
import { GetDriverOrders } from '../../usecases/GetDriverOrders.ts';
import { GetOrderById } from '../../usecases/GetOrderById.ts';
import { AssignDriver } from '../../usecases/AssignDriver.ts';
import { MongoOrderRepo } from '../../db/repos/MongoOrderRepo.ts';
import { authMiddleware } from '../middleware/auth.ts';

const router = Router();
const repo = new MongoOrderRepo();
const createUseCase = new CreateOrder(repo);
const getUseCase = new GetOrders(repo);
const getAllOrdersUseCase = new GetAllOrders(repo);
const getSellerOrdersUseCase = new GetSellerOrders(repo);
const getOrderByIdUseCase = new GetOrderById(repo);
const updateOrderStatusUseCase = new UpdateOrderStatus(repo);
const getAvailableOrdersUseCase = new GetAvailableOrders(repo);
const getDriverOrdersUseCase = new GetDriverOrders(repo);
const assignDriverUseCase = new AssignDriver(repo);
const ctrl = new OrderCtrl(
  createUseCase, 
  getUseCase, 
  getAllOrdersUseCase,
  getSellerOrdersUseCase, 
  getOrderByIdUseCase,
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
