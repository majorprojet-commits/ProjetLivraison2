import { IUserRepo } from '../core/repos/IUserRepo.js';
export class UpdateUserRole {
  constructor(private repo: IUserRepo) {}
  async execute(id: string, role: string, restaurantId?: string) {
    return await this.repo.updateRole(id, role, restaurantId);
  }
}
