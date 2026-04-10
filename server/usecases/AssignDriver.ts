import { IOrderRepo } from '../core/repos/IOrderRepo.js';
import { getDb } from '../lib/firebase-admin.js';

export class AssignDriver {
  constructor(private repo: IOrderRepo) {}
  async execute(orderId: string, driverId: string) {
    const order = await this.repo.assignDriver(orderId, driverId);
    if (order) {
      try {
        const db = getDb();
        await db.collection('orders').doc(orderId).set({
          driverId,
          status: 'delivering',
          updatedAt: new Date()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to update Firestore:", e);
      }
    }
    return order;
  }
}
