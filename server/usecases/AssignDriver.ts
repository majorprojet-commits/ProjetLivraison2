import { IOrderRepo } from '../core/repos/IOrderRepo.js';
import { getDb } from '../lib/firebase-admin.js';

export class AssignDriver {
  constructor(private repo: IOrderRepo) {}
  async execute(orderId: string, driverId: string) {
    const order = await this.repo.assignDriver(orderId, driverId);
    return order;
  }
}
