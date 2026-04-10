import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class AddDishToMenu {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string, dishData: any) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const newDish = {
      id: Math.random().toString(36).substr(2, 9),
      ...dishData,
      available: dishData.available !== undefined ? dishData.available : true
    };

    const updatedMenu = [...(restaurant.menu || []), newDish];
    await this.repo.updateMenu(restaurantId, updatedMenu);
    return newDish;
  }
}
