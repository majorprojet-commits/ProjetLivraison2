import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';

export class UpdateDishAvailability {
  constructor(private repo: IRestaurantRepo) {}
  async execute(restaurantId: string, dishId: string, available: boolean) {
    const restaurant = await this.repo.findById(restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const updatedMenu = (restaurant.menu || []).map((item: any) => 
      item.id === dishId ? { ...item, available } : item
    );

    await this.repo.updateMenu(restaurantId, updatedMenu);
  }
}
