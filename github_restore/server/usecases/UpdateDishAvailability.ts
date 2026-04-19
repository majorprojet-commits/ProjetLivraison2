import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class UpdateDishAvailability {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string, dishId: string, available: boolean) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');

    const updatedMenu = (seller.menu || []).map((item: any) => 
      item.id === dishId ? { ...item, available } : item
    );

    await this.repo.updateMenu(sellerId, updatedMenu);
  }
}
