import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: { type: String },
  orderId: { type: String, required: true },
  userId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  messages: [{
    senderId: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const DisputeModel = mongoose.model('Dispute', schema);
