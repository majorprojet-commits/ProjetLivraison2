import { Request, Response } from 'express';
import { CreateOrder } from '../../usecases/CreateOrder.js';
import { GetOrders } from '../../usecases/GetOrders.js';
import { GetSellerOrders } from '../../usecases/GetSellerOrders.js';
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
    private getSellerOrders: GetSellerOrders,
    private updateOrderStatus: UpdateOrderStatus,
    private getAvailableOrders: GetAvailableOrders,
    private getDriverOrders: GetDriverOrders,
    private assignDriver: AssignDriver
  ) {}
  
  create = async (req: any, res: Response) => {
    try {
      console.log('[OrderCtrl] Creating order:', req.body);
      const data = await this.createOrder.execute({ ...req.body, userId: req.user.id });
      const formatted = OrderVM.format(data);
      
      // Emit to seller room
      if (req.io) {
        console.log(`[Socket] Emitting newOrder to seller_${data.sellerId} and admin`);
        req.io.to(`seller_${data.sellerId}`).emit('newOrder', formatted);
        req.io.to('admin').emit('newOrder', formatted);
      } else {
        console.warn('[Socket] req.io is missing in create order');
      }
      
      res.status(201).json(formatted);
    } catch (e) { 
      console.error('[OrderCtrl] Create error:', e);
      res.status(500).json({ error: 'Server Error', details: e instanceof Error ? e.message : String(e) }); 
    }
  };

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const data = await this.getOrders.execute(req.user.id);
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getForSeller = async (req: AuthRequest, res: Response) => {
    try {
      const sellerId = req.params.sellerId;
      
      // RBAC: Admin can see everything, Seller owner only their own
      if (req.user.role === 'seller' && req.user.sellerId !== sellerId) {
        return res.status(403).json({ error: 'Forbidden: Access restricted to your own store' });
      }
      
      if (req.user.role !== 'seller' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const data = await this.getSellerOrders.execute(sellerId);
      res.json(data.map(OrderVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateStatus = async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'seller' && req.user.role !== 'admin' && req.user.role !== 'driver') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orderId = req.params.id;
      const { status, ...extraData } = req.body;
      const data = await this.updateOrderStatus.execute(orderId, status, extraData);
      if (!data) return res.status(404).json({ error: 'Order not found' });
      
      const formatted = OrderVM.format(data);
      if (req.io) {
        console.log(`[Socket] Emitting orderUpdated for order_${orderId} to rooms`);
        req.io.to(`order_${orderId}`).emit('orderUpdated', formatted);
        req.io.to(`seller_${data.sellerId}`).emit('orderUpdated', formatted);
        req.io.to('admin').emit('orderUpdated', formatted);
        if (status === 'ready') {
          console.log(`[Socket] Emitting orderAvailable to drivers`);
          req.io.to('drivers').emit('orderAvailable', formatted);
        }
      }
      
      res.json(formatted);
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
      console.log(`[OrderCtrl] Fetching orders for driver ${req.user.id}`);
      const data = await this.getDriverOrders.execute(req.user.id);
      console.log(`[OrderCtrl] Found ${data.length} orders for driver ${req.user.id}`);
      res.json(data.map(OrderVM.format));
    } catch (e) { 
      console.error('[OrderCtrl] GetForDriver error:', e);
      res.status(500).json({ error: 'Server Error' }); 
    }
  };

  assignToDriver = async (req: any, res: Response) => {
    try {
      if (req.user.role !== 'driver' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const orderId = req.params.id;
      console.log(`[OrderCtrl] Assigning order ${orderId} to driver ${req.user.id}`);
      const data = await this.assignDriver.execute(orderId, req.user.id);
      if (!data) {
        console.error(`[OrderCtrl] Order ${orderId} not found for assignment`);
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const formatted = OrderVM.format(data);
      if (req.io) {
        console.log(`[Socket] Emitting orderUpdated (assigned) for order_${orderId}`);
        req.io.to(`order_${orderId}`).emit('orderUpdated', formatted);
        req.io.to(`seller_${data.sellerId}`).emit('orderUpdated', formatted);
        req.io.to('admin').emit('orderUpdated', formatted);
      }
      
      console.log(`[OrderCtrl] Order ${orderId} assigned successfully. New status: ${data.status}`);
      res.json(formatted);
    } catch (e) { 
      console.error('[OrderCtrl] Assign error:', e);
      res.status(500).json({ error: 'Server Error' }); 
    }
  };
}
