import { IOrderRepo } from '../core/repos/IOrderRepo.js';
import { Order } from '../core/entities/Order.js';
export class CreateOrder {
  constructor(private repo: IOrderRepo) {}
  async execute(data: any) {
    const order = new Order('', data.userId, data.restaurantId, data.items, data.total, 'PENDING', new Date());
    return await this.repo.create(order);
  }
}
