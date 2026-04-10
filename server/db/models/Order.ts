import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId: String,
  restaurantId: String,
  driverId: String,
  items: Array,
  total: Number,
  status: { type: String, default: 'pending' },
  pickupCode: { type: String }, // 4-char unique code
  clientCode: { type: String }, // Code for delivery confirmation
  deliveryPhoto: { type: String }, // URL to photo
  prepTimeExtension: { type: Number, default: 0 }, // Extra minutes added
  driverEta: { type: Date }, // Estimated arrival time of driver
  pickedUpAt: { type: Date }, // When the driver picked up the order
  restaurantContact: String,
  clientContact: String
}, { timestamps: true });
export const OrderModel = mongoose.model('Order', schema);
