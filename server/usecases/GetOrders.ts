import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetOrders {
  constructor(private repo: IOrderRepo) {}
  async execute(userId: string) {
    return await this.repo.findByUserId(userId);
  }
}
