import { Request, Response } from 'express';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { GetRestaurantMenu } from '../../usecases/GetRestaurantMenu.js';
import { AddDishToMenu } from '../../usecases/AddDishToMenu.js';
import { UpdateDishAvailability } from '../../usecases/UpdateDishAvailability.js';
import { RestaurantVM } from '../viewmodels/RestaurantVM.js';

export class RestaurantCtrl {
  constructor(
    private getRestaurants: GetRestaurants,
    private getRestaurantMenu: GetRestaurantMenu,
    private addDishToMenu: AddDishToMenu,
    private updateDishAvailabilityUC: UpdateDishAvailability
  ) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.getRestaurants.execute();
      res.json(data.map(RestaurantVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  getMenu = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const menu = await this.getRestaurantMenu.execute(id);
      res.json(menu);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  addDish = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dish = await this.addDishToMenu.execute(id, req.body);
      res.json(dish);
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateDishAvailability = async (req: Request, res: Response) => {
    try {
      const { id, dishId } = req.params;
      const { available } = req.body;
      await this.updateDishAvailabilityUC.execute(id, dishId, available);
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
