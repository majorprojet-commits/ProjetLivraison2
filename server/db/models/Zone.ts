import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: { type: String },
  name: { type: String, required: true },
  coordinates: { type: [[Number]], required: true }, // Array of [lat, lng]
  color: { type: String, default: '#9333ea' },
  isActive: { type: Boolean, default: true },
  deliveryFee: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 }
}, { timestamps: true });

export const ZoneModel = mongoose.model('Zone', schema);
