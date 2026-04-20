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
  type: { type: String, enum: ['restaurant', 'clothing', 'supermarket', 'other'], default: 'restaurant' },
  status: { type: String, enum: ['active', 'suspended', 'pending'], default: 'active' },
  ownerId: { type: String },
  isPaused: { type: Boolean, default: false },
  openingHours: { type: Map, of: [String] },
  payouts: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    invoiceUrl: String
  }],
  balance: { type: Number, default: 0 }
}, { timestamps: true });
export const SellerModel = mongoose.model('Seller', schema);
