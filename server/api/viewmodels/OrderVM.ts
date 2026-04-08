import { Order } from '../../core/entities/Order.js';
export class OrderVM {
  static format(o: Order) {
    return { id: o.id, restaurantId: o.restaurantId, total: o.total, status: o.status, date: o.createdAt, driverId: o.driverId, items: o.items };
  }
}
