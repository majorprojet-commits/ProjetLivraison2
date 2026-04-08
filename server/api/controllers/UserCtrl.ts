import { Request, Response } from 'express';
import { GetUser } from '../../usecases/GetUser.js';
import { UpdateUser } from '../../usecases/UpdateUser.js';
import { GetUsers } from '../../usecases/GetUsers.js';
import { UpdateUserRole } from '../../usecases/UpdateUserRole.js';
import { UserVM } from '../viewmodels/UserVM.js';
import { AuthRequest } from '../middleware/auth.js';

export class UserCtrl {
  constructor(
    private getUser: GetUser, 
    private updateUser: UpdateUser,
    private getUsers?: GetUsers,
    private updateUserRole?: UpdateUserRole
  ) {}
  
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

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      if (!this.getUsers) return res.status(500).json({ error: 'Not configured' });
      const data = await this.getUsers.execute();
      res.json(data.map(UserVM.format));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  updateRole = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
      if (!this.updateUserRole) return res.status(500).json({ error: 'Not configured' });
      const { role, restaurantId } = req.body;
      const data = await this.updateUserRole.execute(req.params.id, role, restaurantId);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(UserVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
