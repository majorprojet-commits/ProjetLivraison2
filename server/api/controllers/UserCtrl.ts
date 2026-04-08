import { Request, Response } from 'express';
import { GetUser } from '../../usecases/GetUser.js';
import { UpdateUser } from '../../usecases/UpdateUser.js';
import { UserVM } from '../viewmodels/UserVM.js';
import { AuthRequest } from '../middleware/auth.js';

export class UserCtrl {
  constructor(private getUser: GetUser, private updateUser: UpdateUser) {}
  
  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const data = await this.getUser.execute(req.user.id);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(UserVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const data = await this.updateUser.execute(req.user.id, req.body);
      res.json(UserVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
