import { IUserRepo } from '../../core/repos/IUserRepo.js';
import { User } from '../../core/entities/User.js';
import { UserModel } from '../models/User.js';

export class MongoUserRepo implements IUserRepo {
  async findById(id: string): Promise<User | null> {
    const d = await UserModel.findById(id);
    if (!d) return null;
    return new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.restaurantId);
  }
  async findByEmail(email: string): Promise<User | null> {
    const d = await UserModel.findOne({ email });
    if (!d) return null;
    return new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.restaurantId);
  }
  async create(user: User): Promise<User> {
    const d = await UserModel.create(user);
    return new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.restaurantId);
  }
  async update(user: User): Promise<User> {
    const d = await UserModel.findByIdAndUpdate(user.id, user, { new: true });
    if (!d) throw new Error('User not found');
    return new User(d._id.toString(), d.name||'', d.email||'', d.phone||'', d.role||'', d.password, d.restaurantId);
  }
}
