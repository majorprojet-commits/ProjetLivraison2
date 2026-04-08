import { IOrderRepo } from '../../core/repos/IOrderRepo.js';
import { Order } from '../../core/entities/Order.js';
import { OrderModel } from '../models/Order.js';

export class MongoOrderRepo implements IOrderRepo {
  async create(order: Order): Promise<Order> {
    const doc = await OrderModel.create(order);
    return new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt);
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt));
  }
  async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ restaurantId }).sort({ createdAt: -1 });
    return docs.map(doc => new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt));
  }
  async updateStatus(orderId: string, status: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!doc) return null;
    return new Order(doc._id.toString(), doc.userId||'', doc.restaurantId||'', doc.items||[], doc.total||0, doc.status||'', doc.createdAt);
  }
}
