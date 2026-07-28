import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

export const submitFeedback = async (req, res) => {
  try {
    const { type, rating, message, page } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

    // Get user info if logged in
    let name = 'Anonymous', email = '';
    if (req.userId) {
      const user = await User.findOne({ clerkId: req.userId }).select('name email');
      if (user) { name = user.name; email = user.email; }
    }

    const feedback = await Feedback.create({
      userId: req.userId || null,
      name, email, type, rating, message: message.trim(), page,
    });

    res.status(201).json({ success: true, id: feedback._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Admin endpoints ──
export const getAllFeedback = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const [items, total] = await Promise.all([
      Feedback.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Feedback.countDocuments(query),
    ]);

    const stats = await Feedback.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    const avgRating = await Feedback.aggregate([
      { $match: { rating: { $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    res.json({
      items, total,
      pages: Math.ceil(total / limit),
      stats: Object.fromEntries(stats.map(s => [s._id, s.count])),
      avgRating: avgRating[0]?.avg ? Math.round(avgRating[0].avg * 10) / 10 : null,
      newCount: await Feedback.countDocuments({ status: 'new' }),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateFeedbackStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const fb = await Feedback.findByIdAndUpdate(
      req.params.id, { status, adminNote }, { new: true }
    );
    if (!fb) return res.status(404).json({ error: 'Not found' });
    res.json(fb);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
