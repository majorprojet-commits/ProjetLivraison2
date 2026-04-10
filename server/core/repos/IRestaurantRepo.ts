import { Restaurant } from '../entities/Restaurant.js';
export interface IRestaurantRepo {
  findAll(): Promise<Restaurant[]>;
  findById(id: string): Promise<Restaurant | null>;
  updateMenu(id: string, menu: any[]): Promise<void>;
}
