import { ISellerRepo } from '../../core/repos/ISellerRepo.js';
import { Seller } from '../../core/entities/Seller.js';
import { SellerModel } from '../models/Seller.js';

export class MongoSellerRepo implements ISellerRepo {
  async findAll(): Promise<Seller[]> {
    const docs = await SellerModel.find();
    return docs.map(d => new Seller(d._id.toString(), d.name, d.rating, d.tags, d.image||'', d.deliveryTime||'', d.deliveryFee||0, d.menu||[], (d as any).type || 'restaurant'));
  }
  async findById(id: string): Promise<Seller | null> {
    const d = await SellerModel.findById(id);
    if (!d) return null;
    return new Seller(d._id.toString(), d.name, d.rating, d.tags, d.image||'', d.deliveryTime||'', d.deliveryFee||0, d.menu||[], (d as any).type || 'restaurant');
  }
  async updateMenu(id: string, menu: any[]): Promise<void> {
    await SellerModel.findByIdAndUpdate(id, { menu });
  }
  async updateSettings(id: string, settings: any): Promise<void> {
    await SellerModel.findByIdAndUpdate(id, settings);
  }
}
