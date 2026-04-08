import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, default: 0 },
  tags: [String],
  image: String,
  deliveryTime: String,
  deliveryFee: Number,
  menu: Array
}, { timestamps: true });
export const RestaurantModel = mongoose.model('Restaurant', schema);
