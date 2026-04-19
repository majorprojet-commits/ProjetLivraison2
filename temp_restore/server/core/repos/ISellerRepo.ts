import { Seller } from '../entities/Seller.js';
export interface ISellerRepo {
  findAll(): Promise<Seller[]>;
  findById(id: string): Promise<Seller | null>;
  updateMenu(id: string, menu: any[]): Promise<void>;
  updateSettings(id: string, settings: any): Promise<void>;
}
