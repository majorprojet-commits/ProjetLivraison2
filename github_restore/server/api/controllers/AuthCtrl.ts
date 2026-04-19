import { Request, Response } from 'express';
import { RegisterUser } from '../../usecases/RegisterUser.js';
import { LoginUser } from '../../usecases/LoginUser.js';
import { UserVM } from '../viewmodels/UserVM.js';

export class AuthCtrl {
  constructor(private registerUser: RegisterUser, private loginUser: LoginUser) {}

  register = async (req: Request, res: Response) => {
    try {
      const user = await this.registerUser.execute(req.body);
      res.status(201).json(UserVM.format(user));
    } catch (e: any) { 
      res.status(400).json({ error: e.message || 'Registration failed' }); 
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { user, token } = await this.loginUser.execute(req.body);
      res.json({ user: UserVM.format(user), token });
    } catch (e: any) { 
      res.status(401).json({ error: e.message || 'Login failed' }); 
    }
  };
}
