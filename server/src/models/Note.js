import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, default: 'Untitled Note' },
  content: { type: String, default: '' },
  subject: { type: String, default: '' },
  tags: [{ type: String }],
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  isPinned: { type: Boolean, default: false },
  noteType: { type: String, enum: ['detailed', 'short', 'bullet', 'exam', 'revision', 'custom'], default: 'custom' },
}, { timestamps: true });

noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Note', noteSchema);
