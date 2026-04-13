import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class UpdateDish {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string, dishId: string, dishData: any) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const updatedMenu = (restaurant.menu || []).map((item: any) => 
      item.id === dishId ? { ...item, ...dishData, id: dishId } : item
    );

    await this.repo.updateMenu(restaurantId, updatedMenu);
    return updatedMenu.find((item: any) => item.id === dishId);
  }
}
