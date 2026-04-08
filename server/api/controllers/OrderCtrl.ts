import { Request, Response } from 'express';
import { CreateOrder } from '../../usecases/CreateOrder.js';
import { GetOrders } from '../../usecases/GetOrders.js';
import { GetRestaurantOrders } from '../../usecases/GetRestaurantOrders.js';
import { UpdateOrderStatus } from '../../usecases/UpdateOrderStatus.js';
import { GetAvailableOrders } from '../../usecases/GetAvailableOrders.js';
import { GetDriverOrders } from '../../usecases/GetDriverOrders.js';
import { AssignDriver } from '../../usecases/AssignDriver.js';
import { OrderVM } from '../viewmodels/OrderVM.js';
import { AuthRequest } from '../middleware/auth.js';

export class OrderCtrl {
  constructor(
    private createOrder: CreateOrder, 
    private getOrders: GetOrders,
    private getRestaurantOrders: GetRestaurantOrders,
    private updateOrderStatus: UpdateOrderStatus,
    private getAvailableOrders: GetAvailableOrders,
    private getDriverOrders: GetDriverOrders,
    private assignDriver: AssignDriver
  ) {}
  
  create = async (req: AuthRequest, res: Response) => {
    try {
      const data = await this.createOrder.execute({ ...req.body, userId: req.user.id });
      res.status(201).json(OrderVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const data = await this.getOrders.execute(req.user.id);
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getForRestaurant = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'restaurant' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const restaurantId = req.params.restaurantId;
      const data = await this.getRestaurantOrders.execute(restaurantId);
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateStatus = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'restaurant' && req.user.role !== 'admin' && req.user.role !== 'driver') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orderId = req.params.id;
      const { status } = req.body;
      const data = await this.updateOrderStatus.execute(orderId, status);
      if (!data) return res.status(404).json({ error: 'Order not found' });
      res.json(OrderVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getAvailable = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'driver' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const data = await this.getAvailableOrders.execute();
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getForDriver = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'driver' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const data = await this.getDriverOrders.execute(req.user.id);
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  assignToDriver = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'driver' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orderId = req.params.id;
      const data = await this.assignDriver.execute(orderId, req.user.id);
      if (!data) return res.status(404).json({ error: 'Order not found' });
      res.json(OrderVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
