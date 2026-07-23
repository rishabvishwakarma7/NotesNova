import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  date: { type: Date, required: true, index: true },
  minutesStudied: { type: Number, default: 0 },
  notesCreated: { type: Number, default: 0 },
  quizzesTaken: { type: Number, default: 0 },
  quizAvgScore: { type: Number, default: 0 },
}, { timestamps: true });

studySessionSchema.index({ userId: 1, date: -1 });

export default mongoose.model('StudySession', studySessionSchema);
