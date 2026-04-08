import { Order } from '../entities/Order.js';
export interface IOrderRepo {
  create(order: Order): Promise<Order>;
  findByUserId(userId: string): Promise<Order[]>;
  findByRestaurantId(restaurantId: string): Promise<Order[]>;
  updateStatus(orderId: string, status: string): Promise<Order | null>;
  findAvailableForDelivery(): Promise<Order[]>;
  findByDriverId(driverId: string): Promise<Order[]>;
  assignDriver(orderId: string, driverId: string): Promise<Order | null>;
}
