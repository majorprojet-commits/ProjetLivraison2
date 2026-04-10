import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  messages: [{
    senderId: mongoose.Schema.Types.ObjectId,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export const DisputeModel = mongoose.model('Dispute', schema);
