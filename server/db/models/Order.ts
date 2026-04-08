import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: String,
  restaurantId: String,
  driverId: String,
  items: Array,
  total: Number,
  status: String
}, { timestamps: true });
export const OrderModel = mongoose.model('Order', schema);
