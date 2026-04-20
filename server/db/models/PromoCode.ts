import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  expiryDate: { type: Date, required: true },
  usageLimit: { type: Number },
  usageCount: { type: Number, default: 0 },
  sellerId: { type: String }, // If specific to a seller
  zoneId: { type: String },   // If specific to a zone
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });
export const PromoCodeModel = mongoose.model('PromoCode', schema);
