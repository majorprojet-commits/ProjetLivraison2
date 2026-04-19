import { IUserRepo } from '../core/repos/IUserRepo.js';
import { User } from '../core/entities/User.js';

export class UpdateUser {
  constructor(private repo: IUserRepo) {}
  async execute(id: string, data: any) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error('User not found');
    
    const updatedUser = new User(
      id,
      data.name || existing.name,
      data.email || existing.email,
      data.phone || existing.phone,
      existing.role
    );
    
    return await this.repo.update(updatedUser);
  }
}
