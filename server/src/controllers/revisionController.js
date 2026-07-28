import RevisionTopic from '../models/RevisionTopic.js';

/**
 * SM-2 spaced repetition algorithm
 * quality: 0-5 (0=blackout, 5=perfect)
 */
function sm2(topic, quality) {
  let { easeFactor, interval, timesRevised } = topic;

  if (quality >= 3) {
    if (timesRevised === 0) interval = 1;
    else if (timesRevised === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);

    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextRevision = new Date();
  nextRevision.setDate(nextRevision.getDate() + interval);

  return { interval, easeFactor, nextRevision };
}

export const getTopics = async (req, res) => {
  try {
    const { subject, due } = req.query;
    const query = { userId: req.userId, isArchived: false };
    if (subject) query.subject = subject;
    if (due === 'true') query.nextRevision = { $lte: new Date() };

    const topics = await RevisionTopic.find(query).sort({ nextRevision: 1, createdAt: -1 });
    res.json(topics);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addTopic = async (req, res) => {
  try {
    const { topic, subject, noteId, confidence = 3 } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    // Set first review for tomorrow
    const nextRevision = new Date();
    nextRevision.setDate(nextRevision.getDate() + 1);

    const t = await RevisionTopic.create({
      userId: req.userId, topic, subject, noteId, confidence,
      nextRevision, interval: 1,
    });
    res.status(201).json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const markRevised = async (req, res) => {
  try {
    const { quality, confidence } = req.body; // quality 0-5
    const t = await RevisionTopic.findOne({ _id: req.params.id, userId: req.userId });
    if (!t) return res.status(404).json({ error: 'Topic not found' });

    const { interval, easeFactor, nextRevision } = sm2(t, quality ?? 4);

    t.timesRevised += 1;
    t.lastRevised   = new Date();
    t.interval      = interval;
    t.easeFactor    = easeFactor;
    t.nextRevision  = nextRevision;
    if (confidence) t.confidence = confidence;

    await t.save();
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateTopic = async (req, res) => {
  try {
    const t = await RevisionTopic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body, { new: true }
    );
    if (!t) return res.status(404).json({ error: 'Topic not found' });
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteTopic = async (req, res) => {
  try {
    await RevisionTopic.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getStats = async (req, res) => {
  try {
    const all   = await RevisionTopic.find({ userId: req.userId, isArchived: false });
    const now   = new Date();
    const due   = all.filter(t => t.nextRevision && t.nextRevision <= now).length;
    const mastered = all.filter(t => t.confidence >= 4).length;
    const weak     = all.filter(t => t.confidence <= 2).length;

    const subjects = {};
    all.forEach(t => {
      const s = t.subject || 'General';
      if (!subjects[s]) subjects[s] = { total: 0, due: 0, mastered: 0 };
      subjects[s].total++;
      if (t.nextRevision && t.nextRevision <= now) subjects[s].due++;
      if (t.confidence >= 4) subjects[s].mastered++;
    });

    res.json({ total: all.length, due, mastered, weak, subjects });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
