import Note from '../models/Note.js';
import Chat from '../models/Chat.js';
import Quiz from '../models/Quiz.js';
import StudyPlan from '../models/StudyPlan.js';

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Parallel queries for performance
    const [notes, chats, quizzes, plans] = await Promise.all([
      Note.find({ userId }).select('title subject createdAt updatedAt').sort({ updatedAt: -1 }).limit(10),
      Chat.find({ userId }).select('title mode createdAt updatedAt').sort({ updatedAt: -1 }).limit(10),
      Quiz.find({ userId }).select('title subject attempts createdAt').sort({ createdAt: -1 }),
      StudyPlan.find({ userId }).select('title examDate plan createdAt').sort({ createdAt: -1 }),
    ]);

    // Basic counts
    const totalNotes = notes.length;
    const totalChats = chats.length;
    const totalQuizzes = quizzes.length;

    // Unique subjects
    const subjects = new Set(notes.map(n => n.subject).filter(Boolean));
    const topicsCount = subjects.size;

    // Quiz stats
    const allAttempts = quizzes.flatMap(q => q.attempts);
    const quizAvgScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    // Study streak (consecutive days with any activity)
    const activityDates = new Set();
    notes.forEach(n => activityDates.add(new Date(n.createdAt).toDateString()));
    chats.forEach(c => activityDates.add(new Date(c.createdAt).toDateString()));
    quizzes.forEach(q => {
      activityDates.add(new Date(q.createdAt).toDateString());
      q.attempts.forEach(a => activityDates.add(new Date(a.completedAt).toDateString()));
    });

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      if (activityDates.has(date.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Weekly activity (last 7 days)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayNotes = notes.filter(n => new Date(n.createdAt).toDateString() === dateStr).length;
      const dayQuizzes = quizzes.filter(q => 
        q.attempts.some(a => new Date(a.completedAt).toDateString() === dateStr) ||
        new Date(q.createdAt).toDateString() === dateStr
      ).length;
      const dayChats = chats.filter(c => new Date(c.createdAt).toDateString() === dateStr).length;

      weeklyActivity.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString(),
        notes: dayNotes,
        quizzes: dayQuizzes,
        chats: dayChats,
        total: dayNotes + dayQuizzes + dayChats,
      });
    }

    // Recent activity feed (last 5 items across all types)
    const recentItems = [
      ...notes.slice(0, 5).map(n => ({
        type: 'note', id: n._id, title: n.title, date: n.updatedAt,
      })),
      ...chats.slice(0, 5).map(c => ({
        type: 'chat', id: c._id, title: c.title, date: c.updatedAt,
      })),
      ...quizzes.slice(0, 5).map(q => ({
        type: 'quiz', id: q._id, title: q.title, date: q.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    // Active plan progress
    const activePlan = plans.length > 0 ? (() => {
      const p = plans[0];
      const totalTasks = p.plan.reduce((s, d) => s + d.tasks.length, 0);
      const completedTasks = p.plan.reduce((s, d) => s + d.tasks.filter(t => t.completed).length, 0);
      return {
        id: p._id,
        title: p.title,
        examDate: p.examDate,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    })() : null;

    res.json({
      totalNotes,
      totalChats,
      totalQuizzes,
      topicsCount,
      streak,
      quizAvgScore,
      weeklyActivity,
      recentActivity: recentItems,
      activePlan,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: err.message });
  }
};
