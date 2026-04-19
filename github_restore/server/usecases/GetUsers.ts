import { IUserRepo } from '../core/repos/IUserRepo.js';
export class GetUsers {
  constructor(private repo: IUserRepo) {}
  async execute() {
    return await this.repo.findAll();
  }
}
