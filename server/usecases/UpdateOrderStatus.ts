import { IOrderRepo } from '../core/repos/IOrderRepo.js';
import { getDb } from '../lib/firebase-admin.js';

export class UpdateOrderStatus {
  constructor(private repo: IOrderRepo) {}
  async execute(orderId: string, status: string, extraData: any = {}) {
    if (status === 'picked_up') {
      extraData.pickedUpAt = new Date();
    }
    const order = await this.repo.updateStatus(orderId, status, extraData);
    return order;
  }
}
