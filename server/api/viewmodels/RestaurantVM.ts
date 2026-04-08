import { Restaurant } from '../../core/entities/Restaurant.js';
export class RestaurantVM {
  static format(r: Restaurant) {
    return { id: r.id, name: r.name, rating: r.rating, tags: r.tags, image: r.image, deliveryInfo: `${r.deliveryTime} • ${r.deliveryFee}€`, deliveryTime: r.deliveryTime, deliveryFee: r.deliveryFee, menu: r.menu };
  }
}
