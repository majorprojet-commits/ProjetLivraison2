import { IOrderRepo } from '../../core/repos/IOrderRepo.js';
import { Order } from '../../core/entities/Order.js';
import { OrderModel } from '../models/Order.js';

export class MongoOrderRepo implements IOrderRepo {
  private mapDocToEntity(doc: any): Order {
    return new Order(
      doc._id.toString(),
      doc.userId || '',
      doc.sellerId || '',
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
    const plainObject = {
      userId: order.userId,
      sellerId: order.sellerId,
      items: order.items,
      total: order.total,
      status: order.status,
      pickupCode: order.pickupCode,
      clientCode: order.clientCode,
      driverId: order.driverId,
      deliveryPhoto: order.deliveryPhoto,
      prepTimeExtension: order.prepTimeExtension,
      driverEta: order.driverEta,
      pickedUpAt: order.pickedUpAt
    };
    const doc = await OrderModel.create(plainObject);
    return this.mapDocToEntity(doc);
  }
  async findByUserId(userId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ userId });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async findBySellerId(sellerId: string): Promise<Order[]> {
    const docs = await OrderModel.find({ sellerId }).sort({ createdAt: -1 });
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async findById(id: string): Promise<Order | null> {
    const doc = await OrderModel.findById(id);
    if (!doc) return null;
    return this.mapDocToEntity(doc);
  }
  async findAll(): Promise<Order[]> {
    const docs = await OrderModel.find({}).sort({ createdAt: -1 });
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
    console.log(`[MongoOrderRepo] Found ${docs.length} orders for driver ${driverId}`);
    return docs.map(doc => this.mapDocToEntity(doc));
  }
  async assignDriver(orderId: string, driverId: string): Promise<Order | null> {
    console.log(`[MongoOrderRepo] Assigning driver ${driverId} to order ${orderId}`);
    const doc = await OrderModel.findByIdAndUpdate(orderId, { driverId, status: 'delivering' }, { new: true });
    if (!doc) {
      console.error(`[MongoOrderRepo] Order ${orderId} not found for assignment`);
      return null;
    }
    console.log(`[MongoOrderRepo] Order ${orderId} assigned. Driver in doc: ${doc.driverId}, Status: ${doc.status}`);
    return this.mapDocToEntity(doc);
  }
}
