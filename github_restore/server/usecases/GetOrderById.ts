import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetOrderById {
  constructor(private repo: IOrderRepo) {}
  async execute(id: string) {
    return await this.repo.findById(id);
  }
}
