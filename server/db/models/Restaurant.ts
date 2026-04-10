import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tags: [String],
  image: String,
  deliveryTime: String,
  deliveryFee: Number,
  menu: Array,
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export const RestaurantModel = mongoose.model('Restaurant', schema);
