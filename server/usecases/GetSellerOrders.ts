import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetSellerOrders {
  constructor(private repo: IOrderRepo) {}
  async execute(sellerId: string) {
    return await this.repo.findBySellerId(sellerId);
  }
}
