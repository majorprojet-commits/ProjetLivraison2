import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetAvailableOrders {
  constructor(private repo: IOrderRepo) {}
  async execute() {
    return await this.repo.findAvailableForDelivery();
  }
}
