import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetAllOrders {
  constructor(private repo: IOrderRepo) {}
  async execute() {
    return await this.repo.findAll();
  }
}
