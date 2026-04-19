import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class UpdateDish {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string, dishId: string, dishData: any) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');

    const updatedMenu = (seller.menu || []).map((item: any) => 
      item.id === dishId ? { ...item, ...dishData, id: dishId } : item
    );

    await this.repo.updateMenu(sellerId, updatedMenu);
    return updatedMenu.find((item: any) => item.id === dishId);
  }
}
