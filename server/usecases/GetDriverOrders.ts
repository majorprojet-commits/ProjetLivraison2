import { IOrderRepo } from '../core/repos/IOrderRepo.js';
export class GetDriverOrders {
  constructor(private repo: IOrderRepo) {}
  async execute(driverId: string) {
    return await this.repo.findByDriverId(driverId);
  }
}
