import mongoose from 'mongoose';

const weakTopicSchema = new mongoose.Schema({
  userId:       { type: String, required: true, index: true },
  subject:      { type: String, required: true },
  topic:        { type: String, required: true },
  // Detection signals
  quizAccuracy: { type: Number, default: 0 },  // 0-100 %
  missCount:    { type: Number, default: 1 },  // times wrong in quizzes
  confidence:   { type: Number, default: 1, min: 1, max: 5 },
  lastDetected: { type: Date, default: Date.now },
  // Status
  isResolved:   { type: Boolean, default: false },
  // Related question IDs for mistake notebook
  mistakes:     [{
    question:      String,
    userAnswer:    String,
    correctAnswer: String,
    explanation:   String,
    quizId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    date:          { type: Date, default: Date.now },
  }],
}, { timestamps: true });

weakTopicSchema.index({ userId: 1, subject: 1 });
weakTopicSchema.index({ userId: 1, isResolved: 1 });

export default mongoose.model('WeakTopic', weakTopicSchema);
