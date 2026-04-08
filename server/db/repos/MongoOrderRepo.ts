import { IOrderRepo } from '../../core/repos/IOrderRepo.js';
import { Order } from '../../core/entities/Order.js';
import { OrderModel } from '../models/Order.js';

export class MongoOrderRepo implements IOrderRepo {
  async create(order: Order): Promise<Order> {
    const doc = await OrderModel.create(order);
    return new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId);
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId));
  }
  async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ restaurantId }).sort({ createdAt: -1 });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId));
  }
  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!doc) return null;
    return new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId);
  }
  async findAvailableForDelivery(): Promise<Order[]> {
    const docs = await OrderModel.find({ status: 'ready', driverId: { $exists: false } }).sort({ createdAt: -1 });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId));
  }
  async findByDriverId(driverId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ driverId }).sort({ createdAt: -1 });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId));
  }
  async assignDriver(orderId: string, driverId: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(orderId, { driverId, status: 'delivering' }, { new: true });
    if (!doc) return null;
    return new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt, doc.driverId);
  }
}
