import { Request, Response } from 'express';
import { GetRestaurants } from '../../usecases/GetRestaurants.js';
import { RestaurantVM } from '../viewmodels/RestaurantVM.js';

export class RestaurantCtrl {
  constructor(private getRestaurants: GetRestaurants) {}
  getAll = async (req: Request, res: Response) => {
    try {
      const data = await this.getRestaurants.execute();
      res.json(data.map(RestaurantVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
