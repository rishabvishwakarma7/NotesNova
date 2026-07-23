import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const attemptSchema = new mongoose.Schema({
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: [{ type: Number }],
  completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Untitled Quiz' },
  subject: { type: String, default: '' },
  sourceNoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [questionSchema],
  attempts: [attemptSchema],
}, { timestamps: true });

quizSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('Quiz', quizSchema);
