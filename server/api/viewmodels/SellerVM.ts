import { Seller } from '../../core/entities/Seller.js';
export class SellerVM {
  static format(r: Seller) {
    return { 
      id: r.id, 
      name: r.name, 
      rating: r.rating, 
      tags: r.tags, 
      image: r.image, 
      deliveryInfo: `${r.deliveryTime} • ${r.deliveryFee} FCFA`, 
      deliveryTime: r.deliveryTime, 
      deliveryFee: r.deliveryFee, 
      menu: r.menu, 
      type: r.type,
      status: r.status 
    };
  }
}
