import { Order } from '../../core/entities/Order.js';
export class OrderVM {
  static format(o: Order) {
    return { 
      id: o.id, 
      userId: o.userId,
      sellerId: o.sellerId, 
      total: o.total, 
      status: o.status, 
      date: o.createdAt, 
      driverId: o.driverId, 
      items: o.items,
      pickupCode: o.pickupCode,
      clientCode: o.clientCode,
      deliveryPhoto: o.deliveryPhoto,
      prepTimeExtension: o.prepTimeExtension,
      driverEta: o.driverEta
    };
  }
}
