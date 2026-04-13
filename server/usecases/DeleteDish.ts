import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class DeleteDish {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string, dishId: string) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const updatedMenu = (restaurant.menu || []).filter((item: any) => item.id !== dishId);

    await this.repo.updateMenu(restaurantId, updatedMenu);
  }
}
