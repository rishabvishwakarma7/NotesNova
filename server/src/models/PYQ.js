import mongoose from 'mongoose';

const pyqQuestionSchema = new mongoose.Schema({
  question:    { type: String, required: true },
  answer:      { type: String, required: true },
  marks:       { type: Number, default: 5 },
  importance:  { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  type:        { type: String, enum: ['short', 'long', 'mcq', 'numerical'], default: 'short' },
  year:        { type: String, default: '' },
  keywords:    [{ type: String }],
});

const pyqSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  subject:   { type: String, required: true },
  syllabus:  { type: String, default: '' },
  title:     { type: String, default: '' },
  questions: [pyqQuestionSchema],
  examType:  { type: String, default: 'University Exam' },
}, { timestamps: true });

pyqSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('PYQ', pyqSchema);
