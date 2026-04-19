import { ISellerRepo } from '../core/repos/ISellerRepo.js';
export class GetSellers {
  constructor(private repo: ISellerRepo) {}
  async execute() { return await this.repo.findAll(); }
}
