import mongoose from 'mongoose';

const premiumRequestSchema = new mongoose.Schema({
  // User info
  userId:      { type: String, required: true, index: true }, // clerkId
  name:        { type: String, required: true },
  email:       { type: String, required: true },
  phone:       { type: String, default: '' },

  // Payment info
  transactionId: { type: String, required: true },
  utrNumber:     { type: String, required: true },
  paymentApp:    { type: String, enum: ['PhonePe','Google Pay','Paytm','BHIM','Other'], default: 'Other' },
  amount:        { type: Number, default: 99 },
  screenshot:    { type: String, default: null }, // URL or base64

  // Status
  status:        { type: String, enum: ['pending','approved','rejected'], default: 'pending', index: true },
  rejectionReason: { type: String, default: null },

  // Admin
  reviewedBy:    { type: String, default: null },
  reviewedAt:    { type: Date, default: null },

  // Plan
  plan:          { type: String, default: 'basic_99' },
  planDuration:  { type: String, default: 'lifetime' }, // lifetime | 1month | 1year
}, { timestamps: true });

premiumRequestSchema.index({ userId: 1, status: 1 });
premiumRequestSchema.index({ utrNumber: 1 }, { unique: true, sparse: true });

export default mongoose.model('PremiumRequest', premiumRequestSchema);
