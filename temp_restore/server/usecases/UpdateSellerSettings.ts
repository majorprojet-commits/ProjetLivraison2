import { ISellerRepo } from '../core/repos/ISellerRepo.js';

export class UpdateSellerSettings {
  constructor(private repo: ISellerRepo) {}
  async execute(sellerId: string, settings: any) {
    const seller = await this.repo.findById(sellerId);
    if (!seller) throw new Error('Seller not found');

    await this.repo.updateSettings(sellerId, settings);
  }
}
