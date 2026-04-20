import { Request, Response } from 'express';
import { GetSellers } from '../../usecases/GetSellers.ts';
import { GetSellerMenu } from '../../usecases/GetSellerMenu.ts';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.ts';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.ts';
import { UpdateDish } from '../../usecases/UpdateDish.ts';
import { DeleteDish } from '../../usecases/DeleteDish.ts';
import { UpdateSellerSettings } from '../../usecases/UpdateSellerSettings.ts';
import { SellerVM } from '../viewmodels/SellerVM.ts';
import { SellerModel } from '../../db/models/Seller.ts';
import { Seller } from '../../core/entities/Seller.ts';

export class SellerCtrl {
  constructor(
    private getSellers: GetSellers,
    private getSellerMenu: GetSellerMenu,
    private addDishToMenu: AddDishToMenu,
    private updateDishAvailabilityUC: UpdateDishAvailability,
    private updateDishUC: UpdateDish,
    private deleteDishUC: DeleteDish,
    private updateSettingsUC: UpdateSellerSettings
  ) {}

  create = async (req: any, res: Response) => {
    try {
      const d = await SellerModel.create({
        ...req.body,
        _id: 'r' + Math.random().toString(36).substr(2, 9),
        menu: [],
        rating: 5.0,
        status: 'active'
      });
      const seller = new Seller(
        d._id.toString(), d.name, d.rating, d.tags, d.image||'', 
        d.deliveryTime||'', d.deliveryFee||0, d.menu||[], 
        (d as any).type || 'restaurant', (d as any).status || 'active', (d as any).ownerId
      );
      res.status(201).json(SellerVM.format(seller));
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.getSellers.execute();
      res.json(data.map(SellerVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getMenu = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const menu = await this.getSellerMenu.execute(id);
      res.json(menu);
    } catch (e: any) { 
      res.status(500).json({ error: e.message || 'Server Error' }); 
    }
  };

  addDish = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      
      // RBAC: Seller owner can only add to their own menu
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden: Access restricted to your own store' });
      }

      const dish = await this.addDishToMenu.execute(id, req.body);
      res.json(dish);
    } catch (e: any) { 
      res.status(500).json({ error: e.message || 'Server Error' }); 
    }
  };

  updateDishAvailability = async (req: any, res: Response) => {
    try {
      const { id, dishId } = req.params;
      const { available } = req.body;

      // RBAC: Seller owner can only update their own menu
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden: Access restricted to your own store' });
      }

      await this.updateDishAvailabilityUC.execute(id, dishId, available);
      res.json({ success: true });
    } catch (e: any) { 
      res.status(500).json({ error: e.message || 'Server Error' }); 
    }
  };

  updateDish = async (req: any, res: Response) => {
    try {
      const { id, dishId } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const dish = await this.updateDishUC.execute(id, dishId, req.body);
      res.json(dish);
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  deleteDish = async (req: any, res: Response) => {
    try {
      const { id, dishId } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await this.deleteDishUC.execute(id, dishId);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  updateSettings = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await this.updateSettingsUC.execute(id, req.body);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  togglePause = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const seller = await SellerModel.findById(id);
      if (!seller) return res.status(404).json({ error: 'Seller not found' });
      
      const newPaused = !seller.get('isPaused');
      await SellerModel.findByIdAndUpdate(id, { isPaused: newPaused });
      res.json({ isPaused: newPaused });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  updateOpeningHours = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { hours } = req.body; // Map of day -> string[]
      await SellerModel.findByIdAndUpdate(id, { openingHours: hours });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };

  getPayouts = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      if (req.user.role === 'seller' && req.user.sellerId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const seller = await SellerModel.findById(id);
      if (!seller) return res.status(404).json({ error: 'Seller not found' });
      res.json({ payouts: seller.get('payouts') || [], balance: seller.get('balance') || 0 });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };
}
