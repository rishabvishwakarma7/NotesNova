import User from '../models/User.js';
import Note from '../models/Note.js';
import Chat from '../models/Chat.js';
import Quiz from '../models/Quiz.js';
import StudyPlan from '../models/StudyPlan.js';
import Folder from '../models/Folder.js';

// ── helpers ──────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ── Overview stats ────────────────────────────────────────────────────────────

export const getAdminStats = async (_req, res) => {
  try {
    const [
      totalUsers, totalNotes, totalChats, totalQuizzes, totalPlans,
      newUsersToday, newNotesToday, newChatsToday,
      newUsersWeek, newNotesWeek,
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Chat.countDocuments(),
      Quiz.countDocuments(),
      StudyPlan.countDocuments(),
      User.countDocuments({ createdAt: { $gte: daysAgo(0) } }),
      Note.countDocuments({ createdAt: { $gte: daysAgo(0) } }),
      Chat.countDocuments({ createdAt: { $gte: daysAgo(0) } }),
      User.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
      Note.countDocuments({ createdAt: { $gte: daysAgo(7) } }),
    ]);

    // Daily activity for last 14 days
    const dailyActivity = [];
    for (let i = 13; i >= 0; i--) {
      const from = daysAgo(i);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      const [notes, chats, users] = await Promise.all([
        Note.countDocuments({ createdAt: { $gte: from, $lt: to } }),
        Chat.countDocuments({ createdAt: { $gte: from, $lt: to } }),
        User.countDocuments({ createdAt: { $gte: from, $lt: to } }),
      ]);
      dailyActivity.push({
        date: from.toISOString().split('T')[0],
        day: from.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        notes, chats, users, total: notes + chats,
      });
    }

    // AI usage breakdown
    const chatModes = await Chat.aggregate([
      { $group: { _id: '$mode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const noteTypes = await Note.aggregate([
      { $group: { _id: '$noteType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Quiz stats
    const quizzes = await Quiz.find().select('attempts difficulty');
    const allAttempts = quizzes.flatMap(q => q.attempts);
    const avgScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    res.json({
      totals: { users: totalUsers, notes: totalNotes, chats: totalChats, quizzes: totalQuizzes, plans: totalPlans },
      today: { users: newUsersToday, notes: newNotesToday, chats: newChatsToday },
      week: { users: newUsersWeek, notes: newNotesWeek },
      dailyActivity,
      chatModes,
      noteTypes,
      quiz: { totalAttempts: allAttempts.length, avgScore },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Users ─────────────────────────────────────────────────────────────────────

export const getAdminUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const query = search
      ? { $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ] }
      : {};

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(query),
    ]);

    // Attach activity counts per user
    const userIds = users.map(u => u.clerkId);
    const [noteCounts, chatCounts, quizCounts] = await Promise.all([
      Note.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
      Chat.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
      Quiz.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
    ]);

    const noteMap = Object.fromEntries(noteCounts.map(x => [x._id, x.count]));
    const chatMap = Object.fromEntries(chatCounts.map(x => [x._id, x.count]));
    const quizMap = Object.fromEntries(quizCounts.map(x => [x._id, x.count]));

    const enriched = users.map(u => ({
      _id: u._id,
      clerkId: u.clerkId,
      name: u.name,
      email: u.email,
      profileImage: u.profileImage,
      createdAt: u.createdAt,
      notes: noteMap[u.clerkId] || 0,
      chats: chatMap[u.clerkId] || 0,
      quizzes: quizMap[u.clerkId] || 0,
    }));

    res.json({ users: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Recent activity feed ──────────────────────────────────────────────────────

export const getAdminActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const [notes, chats, quizzes, users] = await Promise.all([
      Note.find().sort({ createdAt: -1 }).limit(limit).select('title subject userId createdAt'),
      Chat.find().sort({ createdAt: -1 }).limit(limit).select('title mode userId createdAt'),
      Quiz.find().sort({ createdAt: -1 }).limit(limit).select('title difficulty userId createdAt'),
      User.find().sort({ createdAt: -1 }).limit(20).select('name email createdAt'),
    ]);

    // Fetch user names for activity items
    const clerkIds = [...new Set([
      ...notes.map(n => n.userId),
      ...chats.map(c => c.userId),
      ...quizzes.map(q => q.userId),
    ])];
    const userDocs = await User.find({ clerkId: { $in: clerkIds } }).select('clerkId name email');
    const userMap = Object.fromEntries(userDocs.map(u => [u.clerkId, { name: u.name, email: u.email }]));

    const feed = [
      ...notes.map(n => ({ type: 'note', id: n._id, title: n.title, meta: n.subject, userId: n.userId, user: userMap[n.userId], createdAt: n.createdAt })),
      ...chats.map(c => ({ type: 'chat', id: c._id, title: c.title, meta: c.mode, userId: c.userId, user: userMap[c.userId], createdAt: c.createdAt })),
      ...quizzes.map(q => ({ type: 'quiz', id: q._id, title: q.title, meta: q.difficulty, userId: q.userId, user: userMap[q.userId], createdAt: q.createdAt })),
      ...users.map(u => ({ type: 'signup', id: u._id, title: u.name, meta: u.email, userId: null, user: { name: u.name, email: u.email }, createdAt: u.createdAt })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Individual user detail ────────────────────────────────────────────────────

export const getAdminUserDetail = async (req, res) => {
  try {
    const { userId } = req.params; // clerkId

    const user = await User.findOne({ clerkId: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const [notes, chats, quizzes, plans] = await Promise.all([
      Note.find({ userId }).sort({ createdAt: -1 }).select('title subject noteType tags isPinned createdAt updatedAt'),
      Chat.find({ userId }).sort({ updatedAt: -1 }).select('title mode messages isPinned createdAt updatedAt'),
      Quiz.find({ userId }).sort({ createdAt: -1 }).select('title subject difficulty questions attempts createdAt'),
      StudyPlan.find({ userId }).sort({ createdAt: -1 }).select('title examDate subjects hoursPerDay plan createdAt'),
    ]);

    // Activity timeline: all events sorted by date
    const timeline = [
      ...notes.map(n => ({ type: 'note', id: n._id, title: n.title, meta: n.subject || n.noteType, createdAt: n.createdAt })),
      ...chats.map(c => ({ type: 'chat', id: c._id, title: c.title, meta: c.mode, messageCount: c.messages.length, createdAt: c.createdAt })),
      ...quizzes.map(q => ({ type: 'quiz', id: q._id, title: q.title, meta: q.difficulty, attempts: q.attempts.length, createdAt: q.createdAt })),
      ...plans.map(p => ({ type: 'plan', id: p._id, title: p.title, meta: p.subjects?.join(', '), createdAt: p.createdAt })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Daily activity for last 30 days
    const activityDays = [];
    for (let i = 29; i >= 0; i--) {
      const from = daysAgo(i);
      const to = new Date(from); to.setDate(to.getDate() + 1);
      const dayNotes = notes.filter(n => new Date(n.createdAt) >= from && new Date(n.createdAt) < to).length;
      const dayChats = chats.filter(c => new Date(c.createdAt) >= from && new Date(c.createdAt) < to).length;
      const dayQuizzes = quizzes.filter(q => new Date(q.createdAt) >= from && new Date(q.createdAt) < to).length;
      activityDays.push({
        date: from.toISOString().split('T')[0],
        notes: dayNotes, chats: dayChats, quizzes: dayQuizzes,
        total: dayNotes + dayChats + dayQuizzes,
      });
    }

    // Quiz performance
    const allAttempts = quizzes.flatMap(q => q.attempts);
    const avgScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    res.json({
      user: { _id: user._id, clerkId: user.clerkId, name: user.name, email: user.email, profileImage: user.profileImage, createdAt: user.createdAt },
      counts: { notes: notes.length, chats: chats.length, quizzes: quizzes.length, plans: plans.length },
      quiz: { avgScore, totalAttempts: allAttempts.length },
      timeline,
      activityDays,
      chats: chats.map(c => ({
        _id: c._id, title: c.title, mode: c.mode,
        messageCount: c.messages.length,
        messages: c.messages,
        createdAt: c.createdAt, updatedAt: c.updatedAt,
      })),
      notes: notes.slice(0, 30),
      quizzes: quizzes.slice(0, 20),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── All AI chats (admin view) ─────────────────────────────────────────────────

export const getAdminChats = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const mode = req.query.mode || '';
    const search = req.query.search || '';

    const query = {};
    if (mode) query.mode = mode;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [chats, total] = await Promise.all([
      Chat.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit),
      Chat.countDocuments(query),
    ]);

    // Attach user info
    const clerkIds = [...new Set(chats.map(c => c.userId))];
    const userDocs = await User.find({ clerkId: { $in: clerkIds } }).select('clerkId name email profileImage');
    const userMap = Object.fromEntries(userDocs.map(u => [u.clerkId, u]));

    const enriched = chats.map(c => ({
      _id: c._id,
      title: c.title,
      mode: c.mode,
      messageCount: c.messages.length,
      messages: c.messages,
      isPinned: c.isPinned,
      userId: c.userId,
      user: userMap[c.userId] || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json({ chats: enriched, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
