import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  profileImage: { type: String, default: '' },
  // ── Premium ──────────────────────────────────────────────
  isPremium:        { type: Boolean, default: false, index: true },
  premiumStatus:    { type: String, enum: ['none','pending','active','expired','rejected'], default: 'none' },
  premiumSince:     { type: Date, default: null },
  premiumExpiry:    { type: Date, default: null },   // null = lifetime
  premiumPlan:      { type: String, default: 'basic_99' },
  approvedBy:       { type: String, default: null }, // admin ID
  approvedAt:       { type: Date, default: null },
  paymentId:        { type: String, default: null }, // UTR / transaction ID
  paymentMethod:    { type: String, default: null },
  paymentScreenshot:{ type: String, default: null },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
