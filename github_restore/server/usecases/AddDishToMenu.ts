import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class AddDishToMenu {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string, dishData: any) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');

    const newDish = {
      id: Math.random().toString(36).substr(2, 9),
      ...dishData,
      available: dishData.available !== undefined ? dishData.available : true
    };

    const updatedMenu = [...(seller.menu || []), newDish];
    await this.repo.updateMenu(sellerId, updatedMenu);
    return newDish;
  }
}
