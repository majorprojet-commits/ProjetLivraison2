import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class GetRestaurantMenu {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');
    return restaurant.menu;
  }
}
