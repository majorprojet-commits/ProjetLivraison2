import { Order } from '../entities/Order.js';
export interface IOrderRepo {
  create(order: Order): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
  findBySellerId(sellerId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  updateStatus(orderId: string, status: string, extraData?: any): Promise<Order | null>;
  findAvailableForDelivery(): Promise<Order[]>;
  findByDriverId(driverId: string): Promise<Order[]>;
  assignDriver(orderId: string, driverId: string): Promise<Order | null>;
}
