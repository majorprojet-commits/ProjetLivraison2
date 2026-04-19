import { IOrderRepo } from '../core/repos/IOrderRepo.js';
import { Order } from '../core/entities/Order.js';
import { getDb } from '../lib/firebase-admin.js';

export class CreateOrder {
  constructor(private repo: IOrderRepo) {}
  async execute(data: any) {
    const pickupCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const clientCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const order = new Order(
      '', 
      data.userId, 
      data.sellerId, 
      data.items, 
      data.total, 
      'pending', 
      new Date(),
      undefined,
      pickupCode,
      clientCode
    );
    const created = await this.repo.create(order);
    return created;
  }
}
