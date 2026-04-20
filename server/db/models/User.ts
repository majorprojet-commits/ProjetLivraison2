import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  _id: { type: String },
  name: String,
  email: { type: String, unique: true, required: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, default: 'client' },
  sellerId: { type: String }, // For seller owners
  isBanned: { type: Boolean, default: false },
  driverInfo: {
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    documents: [String],
    performanceScore: { type: Number, default: 4.5 },
    totalDeliveries: { type: Number, default: 0 },
    equipmentStatus: String
  }
}, { timestamps: true });
export const UserModel = mongoose.model('User', schema);
