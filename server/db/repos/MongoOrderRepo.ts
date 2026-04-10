import { IOrderRepo } from '../../core/repos/IOrderRepo.js';
import { Order } from '../../core/entities/Order.js';
import { OrderModel } from '../models/Order.js';

export class MongoOrderRepo implements IOrderRepo {
  private mapDocToEntity(doc: any): Order {
    return new Order(
      doc._id.toString(),
      doc.userId || '',
      doc.restaurantId || '',
      doc.items || [],
      doc.total || 0,
      doc.status || '',
      doc.createdAt,
      doc.driverId,
      doc.pickupCode,
      doc.clientCode,
      doc.deliveryPhoto,
      doc.prepTimeExtension,
      doc.driverEta,
      doc.pickedUpAt
    );
  }

  async create(order: Order): Promise<Order> {
    const doc = await OrderModel.create(order);
    return this.mapDocToEntity(doc);
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async findByRestaurantId(restaurantId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ restaurantId }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async updateStatus(orderId: string, status: string, extraData: any = {}): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(orderId, { status, ...extraData }, { new: true });
    if (!doc) return null;
    return this.mapDocToEntity(doc);
  }
  async findAvailableForDelivery(): Promise<Order[]> {
    const docs = await OrderModel.find({ status: 'ready', driverId: { $exists: false } }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async findByDriverId(driverId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ driverId }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async assignDriver(orderId: string, driverId: string): Promise<Order | null> {
    const doc = await OrderModel.findByIdAndUpdate(orderId, { driverId, status: 'delivering' }, { new: true });
    if (!doc) return null;
    return this.mapDocToEntity(doc);
  }
}
