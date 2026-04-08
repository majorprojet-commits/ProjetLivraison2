import { IUserRepo } from '../core/repos/IUserRepo.js';
export class GetUser {
  constructor(private repo: IUserRepo) {}
  async execute(id: string) { return await this.repo.findById(id); }
}
