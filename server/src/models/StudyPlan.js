import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  subject: { type: String, default: '' },
  duration: { type: String, default: '1 hour' },
  type: { type: String, enum: ['study', 'practice', 'revision', 'break'], default: 'study' },
  completed: { type: Boolean, default: false },
});

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  date: { type: Date, required: true },
  tasks: [taskSchema],
});

const studyPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, default: 'Study Plan' },
  examDate: { type: Date, required: true },
  subjects: [{ type: String }],
  topics: [{ type: String }],
  hoursPerDay: { type: Number, default: 4 },
  plan: [daySchema],
}, { timestamps: true });

studyPlanSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('StudyPlan', studyPlanSchema);
