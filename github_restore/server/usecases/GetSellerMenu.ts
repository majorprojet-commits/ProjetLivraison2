import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class GetSellerMenu {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');
    return seller.menu;
  }
}
