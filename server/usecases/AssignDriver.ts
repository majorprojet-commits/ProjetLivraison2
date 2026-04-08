import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class AssignDriver {
  constructor(private repo: IOrderRepo) {}
  async execute(orderId: string, driverId: string) {
    return await this.repo.assignDriver(orderId, driverId);
  }
}
