import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class UpdateRestaurantSettings {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string, settings: any) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    // In a real app, we'd have a specific method for this in the repo
    // For now, we'll use the model directly or add a method to repo
    // Let's assume we add updateSettings to IRestaurantRepo
    await (this.repo as any).updateSettings(restaurantId, settings);
  }
}
