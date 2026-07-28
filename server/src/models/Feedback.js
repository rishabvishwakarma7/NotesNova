import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId:   { type: String, default: null },        // null = anonymous
  name:     { type: String, default: 'Anonymous' },
  email:    { type: String, default: '' },
  type:     { type: String, enum: ['bug', 'feature', 'general', 'praise'], default: 'general' },
  rating:   { type: Number, min: 1, max: 5, default: null },
  message:  { type: String, required: true },
  page:     { type: String, default: '' },          // which page feedback was from
  status:   { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
  adminNote:{ type: String, default: '' },
}, { timestamps: true });

feedbackSchema.index({ createdAt: -1 });

export default mongoose.model('Feedback', feedbackSchema);
