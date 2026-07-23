import Note from '../models/Note.js';
import Chat from '../models/Chat.js';
import Quiz from '../models/Quiz.js';
import StudyPlan from '../models/StudyPlan.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ results: [] });
    }

    const userId = req.userId;
    const regex = new RegExp(q.trim(), 'i');

    const [notes, chats, quizzes, plans] = await Promise.all([
      Note.find({
        userId,
        $or: [
          { title: regex },
          { content: regex },
          { subject: regex },
          { tags: regex },
        ],
      })
        .select('title subject tags updatedAt')
        .sort({ updatedAt: -1 })
        .limit(10),

      Chat.find({
        userId,
        $or: [{ title: regex }],
      })
        .select('title mode updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5),

      Quiz.find({
        userId,
        $or: [{ title: regex }, { subject: regex }],
      })
        .select('title subject difficulty createdAt')
        .sort({ createdAt: -1 })
        .limit(5),

      StudyPlan.find({
        userId,
        $or: [
          { title: regex },
          { subjects: regex },
          { topics: regex },
        ],
      })
        .select('title subjects examDate createdAt')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const results = [
      ...notes.map(n => ({
        type: 'note',
        id: n._id,
        title: n.title,
        subtitle: n.subject || 'No subject',
        href: `/dashboard/notes/${n._id}`,
        date: n.updatedAt,
      })),
      ...chats.map(c => ({
        type: 'chat',
        id: c._id,
        title: c.title,
        subtitle: c.mode,
        href: `/dashboard/chat?id=${c._id}`,
        date: c.updatedAt,
      })),
      ...quizzes.map(q => ({
        type: 'quiz',
        id: q._id,
        title: q.title,
        subtitle: `${q.difficulty} • ${q.subject || 'General'}`,
        href: `/dashboard/quiz?id=${q._id}`,
        date: q.createdAt,
      })),
      ...plans.map(p => ({
        type: 'plan',
        id: p._id,
        title: p.title,
        subtitle: p.subjects.join(', ') || 'Study Plan',
        href: `/dashboard/planner?id=${p._id}`,
        date: p.createdAt,
      })),
    ];

    // Sort all results by date, newest first
    results.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ results, total: results.length });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: err.message });
  }
};
