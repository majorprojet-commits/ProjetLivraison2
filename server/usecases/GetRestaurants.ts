import { IRestaurantRepo } from '../core/repos/IRestaurantRepo.js';
export class GetRestaurants {
  constructor(private repo: IRestaurantRepo) {}
  async execute() { return await this.repo.findAll(); }
}
