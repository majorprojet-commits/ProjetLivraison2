import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  category: { type: String }, // e.g., 'restaurant', 'pharmacy', 'grocery'
  rating: { type: Number, default: 0 },
  walletBalance: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Seller = mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
