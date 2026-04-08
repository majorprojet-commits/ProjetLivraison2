import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class UpdateOrderStatus {
  constructor(private repo: IOrderRepo) {}
  async execute(orderId: string, status: string) {
    return await this.repo.updateStatus(orderId, status);
  }
}
