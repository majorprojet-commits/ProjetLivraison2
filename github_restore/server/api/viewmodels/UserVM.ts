import { User } from '../../core/entities/User.js';
export class UserVM {
  static format(u: User) {
    return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role, sellerId: u.sellerId };
  }
}
