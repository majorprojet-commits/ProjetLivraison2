import { Request, Response } from 'express';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { GetRestaurantMenu } from '../../usecases/GetRestaurantMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { UpdateDish } from '../../usecases/UpdateDish.js';
import { DeleteDish } from '../../usecases/DeleteDish.js';
import { UpdateRestaurantSettings } from '../../usecases/UpdateRestaurantSettings.js';
import { RestaurantVM } from '../viewmodels/RestaurantVM.js';

export class RestaurantCtrl {
  constructor(
    private getRestaurants: GetRestaurants,
    private getRestaurantMenu: GetRestaurantMenu,
    private addDishToMenu: AddDishToMenu,
    private updateDishAvailabilityUC: UpdateDishAvailability,
    private updateDishUC: UpdateDish,
    private deleteDishUC: DeleteDish,
    private updateSettingsUC: UpdateRestaurantSettings
  ) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.getRestaurants.execute();
      res.json(data.map(RestaurantVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getMenu = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      const menu = await this.getRestaurantMenu.execute(id);
      res.json(menu);
    } catch (e: any) { 
      res.status(500).json({ error: e.message || 'Server Error' }); 
    }
  };

  addDish = async (req: any, res: Response) => {
    try {
      const { id } = req.params;
      
      // RBAC: Restaurant owner can only add to their own menu
      if (req.user.role === 'restaurant' && req.user.restaurantId !== id) {
        return res.status(403).json({ error: 'Forbidden: Access restricted to your own restaurant' });
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

      // RBAC: Restaurant owner can only update their own menu
      if (req.user.role === 'restaurant' && req.user.restaurantId !== id) {
        return res.status(403).json({ error: 'Forbidden: Access restricted to your own restaurant' });
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
      if (req.user.role === 'restaurant' && req.user.restaurantId !== id) {
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
      if (req.user.role === 'restaurant' && req.user.restaurantId !== id) {
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
      if (req.user.role === 'restaurant' && req.user.restaurantId !== id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await this.updateSettingsUC.execute(id, req.body);
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'Server Error' });
    }
  };
}
