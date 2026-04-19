import { Request, Response } from 'express';
import { GetUser } from '../../usecases/GetUser.ts';
import { UpdateUser } from '../../usecases/UpdateUser.ts';
import { GetUsers } from '../../usecases/GetUsers.ts';
import { UpdateUserRole } from '../../usecases/UpdateUserRole.ts';
import { UserVM } from '../viewmodels/UserVM.ts';
import { AuthRequest } from '../middleware/auth.ts';

export class UserCtrl {
  constructor(
    private getUser: GetUser, 
    private updateUser: UpdateUser,
    private getUsers?: GetUsers,
    private updateUserRole?: UpdateUserRole
  ) {}
  
  getProfile = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user.id === 'dev-admin-id') {
        return res.json({ id: 'dev-admin-id', role: 'admin', name: 'Administrateur (Dev)', email: 'dev@example.com', sellerId: 'r1' });
      }
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
      const { role, sellerId } = req.body;
      const data = await this.updateUserRole.execute(req.params.id, role, sellerId);
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(UserVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };

  promoteToAdmin = async (req: AuthRequest, res: Response) => {
    try {
      // Endpoint de test pour permettre de voir le dashboard admin facilement
      if (!this.updateUserRole) return res.status(500).json({ error: 'Not configured' });
      const data = await this.updateUserRole.execute(req.user.id, 'admin');
      if (!data) return res.status(404).json({ error: 'Not found' });
      res.json(UserVM.format(data));
    } catch (e) { res.status(500).json({ error: 'Server Error' }); }
  };
}
