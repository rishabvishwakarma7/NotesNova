import mongoose from 'mongoose';

const revisionTopicSchema = new mongoose.Schema({
  userId:        { type: String, required: true, index: true },
  topic:         { type: String, required: true },
  subject:       { type: String, default: '' },
  confidence:    { type: Number, default: 3, min: 1, max: 5 }, // 1=weak, 5=mastered
  timesRevised:  { type: Number, default: 0 },
  lastRevised:   { type: Date, default: null },
  nextRevision:  { type: Date, default: null },   // spaced repetition due date
  interval:      { type: Number, default: 1 },    // days until next review
  easeFactor:    { type: Number, default: 2.5 },  // SM-2 ease factor
  noteId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
  isArchived:    { type: Boolean, default: false },
}, { timestamps: true });

revisionTopicSchema.index({ userId: 1, nextRevision: 1 });
revisionTopicSchema.index({ userId: 1, subject: 1 });

export default mongoose.model('RevisionTopic', revisionTopicSchema);
