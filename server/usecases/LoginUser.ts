import { IUserRepo } from '../core/repos/IUserRepo.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class LoginUser {
  constructor(private repo: IUserRepo) {}
  async execute(data: any) {
    const user = await this.repo.findByEmail(data.email);
    if (!user || !user.password) throw new Error('Invalid credentials');

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) throw new Error('Invalid credentials');

    const token = jwt.sign(
      { id: user.id, role: user.role, restaurantId: user.restaurantId },
      process.env.JWT_SECRET || 'super-secret-key',
      { expiresIn: '7d' }
    );

    return { user, token };
  }
}
