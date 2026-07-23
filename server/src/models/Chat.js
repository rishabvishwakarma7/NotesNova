import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
  mode: { type: String, enum: ['study', 'coding', 'research', 'exam', 'simple'], default: 'study' },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

chatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Chat', chatSchema);
