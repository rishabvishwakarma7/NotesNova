import mongoose from 'mongoose';

const dailyTaskSchema = new mongoose.Schema({
  userId:      { type: String, required: true, index: true },
  date:        { type: String, required: true }, // YYYY-MM-DD
  subject:     { type: String, default: '' },
  unit:        { type: String, default: '' },
  topic:       { type: String, required: true },
  taskType:    {
    type: String,
    enum: ['learn','read_notes','generate_notes','practice','quiz','revise','solve_pyq','review_mistakes'],
    default: 'learn',
  },
  duration:    { type: Number, default: 25 },  // minutes
  priority:    { type: String, enum: ['high','medium','low'], default: 'medium' },
  difficulty:  { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  completed:   { type: Boolean, default: false },
  completedAt: { type: Date, default: null },
  skipped:     { type: Boolean, default: false },
  rescheduled: { type: Boolean, default: false },
  sourceType:  { type: String, enum: ['ai_generated','manual','rescheduled'], default: 'ai_generated' },
  // Links to other resources
  noteId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  quizId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
}, { timestamps: true });

dailyTaskSchema.index({ userId: 1, date: 1 });
dailyTaskSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('DailyTask', dailyTaskSchema);
