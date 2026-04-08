import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetRestaurantOrders {
  constructor(private repo: IOrderRepo) {}
  async execute(restaurantId: string) {
    return await this.repo.findByRestaurantId(restaurantId);
  }
}
