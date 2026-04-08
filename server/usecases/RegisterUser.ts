import { IUserRepo } from '../core/repos/IUserRepo.js';
import { User } from '../core/entities/User.js';
import bcrypt from 'bcryptjs';

export class RegisterUser {
  constructor(private repo: IUserRepo) {}
  async execute(data: any) {
    const existing = await this.repo.findByEmail(data.email);
    if (existing) throw new Error('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User('', data.name, data.email, data.phone || '', 'client', hashedPassword);
    
    return await this.repo.create(user);
  }
}
