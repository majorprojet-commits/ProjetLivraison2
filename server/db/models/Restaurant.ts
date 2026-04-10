import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tags: [String],
  image: String,
  deliveryTime: String,
  deliveryFee: Number,
  menu: Array,
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  ownerId: { type: String }
}, { timestamps: true });
export const RestaurantModel = mongoose.model('Restaurant', schema);
