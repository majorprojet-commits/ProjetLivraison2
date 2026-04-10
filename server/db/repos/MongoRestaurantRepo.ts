import { IRestaurantRepo } from '../../core/repos/IRestaurantRepo.js';
import { Restaurant } from '../../core/entities/Restaurant.js';
import { RestaurantModel } from '../models/Restaurant.js';

export class MongoRestaurantRepo implements IRestaurantRepo {
  async findAll(): Promise<Restaurant[]> {
    const docs = await RestaurantModel.find();
    return docs.map(d => new Restaurant(d._id.toString(), d.name, d.rating, d.tags, d.image||'', d.deliveryTime||'', d.deliveryFee||0, d.menu||[]));
  }
  async findById(id: string): Promise<Restaurant | null> {
    const d = await RestaurantModel.findById(id);
    if (!d) return null;
    return new Restaurant(d._id.toString(), d.name, d.rating, d.tags, d.image||'', d.deliveryTime||'', d.deliveryFee||0, d.menu||[]);
  }
  async updateMenu(id: string, menu: any[]): Promise<void> {
    await RestaurantModel.findByIdAndUpdate(id, { menu });
  }
}
