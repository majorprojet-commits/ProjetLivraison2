import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  adminId: { type: String, required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true }, // 'user', 'seller', 'order', 'config'
  targetId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String
}, { timestamps: true });
export const AuditLogModel = mongoose.model('AuditLog', schema);
