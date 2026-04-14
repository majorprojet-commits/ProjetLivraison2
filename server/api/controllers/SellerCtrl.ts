import { Request, Response } from 'express';
import { GetSellers } from '../../usecases/GetSellers.js';
import { GetSellerMenu } from '../../usecases/GetSellerMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { UpdateDish } from '../../usecases/UpdateDish.js';
import { DeleteDish } from '../../usecases/DeleteDish.js';
import { UpdateSellerSettings } from '../../usecases/UpdateSellerSettings.js';
import { SellerVM } from '../viewmodels/SellerVM.js';

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
}
