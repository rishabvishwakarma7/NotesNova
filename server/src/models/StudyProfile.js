import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  color:     { type: String, default: '#8B5CF6' },
  units:     [{ type: String }],
  priority:  { type: Number, default: 1 }, // 1=high, 2=medium, 3=low
  order:     { type: Number, default: 0 },
});

const studyProfileSchema = new mongoose.Schema({
  userId:           { type: String, required: true, unique: true, index: true },
  // Academic info
  course:           { type: String, default: '' },
  university:       { type: String, default: '' },
  branch:           { type: String, default: '' },
  semester:         { type: String, default: '' },
  // Exam info
  examDate:         { type: Date, default: null },
  examName:         { type: String, default: '' },
  // Subjects
  subjects:         [subjectSchema],
  // Study preferences
  dailyStudyTime:   { type: Number, default: 120 }, // minutes per day
  studyGoal:        { type: String, enum: ['pass','score60','score75','maximize'], default: 'score75' },
  prepLevel:        { type: String, enum: ['not_started','beginner','partial','mostly'], default: 'beginner' },
  // Onboarding
  onboardingDone:   { type: Boolean, default: false },
  // Journey state
  currentSubjectIdx: { type: Number, default: 0 },
  totalStudyMinutes: { type: Number, default: 0 }, // lifetime minutes
  streakDays:        { type: Number, default: 0 },
  lastStudyDate:     { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model('StudyProfile', studyProfileSchema);
