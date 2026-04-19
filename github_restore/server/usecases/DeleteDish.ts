import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class DeleteDish {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string, dishId: string) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');

    const updatedMenu = (seller.menu || []).filter((item: any) => item.id !== dishId);

    await this.repo.updateMenu(sellerId, updatedMenu);
  }
}
