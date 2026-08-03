import DailyTask from '../models/DailyTask.js';
import Quiz from '../models/Quiz.js';
import Note from '../models/Note.js';
import RevisionTopic from '../models/RevisionTopic.js';
import WeakTopic from '../models/WeakTopic.js';
import StudyProfile from '../models/StudyProfile.js';

export const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekStart = weekAgo.toISOString().slice(0, 10);
    const weekEnd   = now.toISOString().slice(0, 10);

    const [tasks, quizzes, notes, revisions, weakTopics, profile] = await Promise.all([
      DailyTask.find({ userId, date: { $gte: weekStart, $lte: weekEnd } }),
      Quiz.find({ userId, createdAt: { $gte: weekAgo }, isDeleted: { $ne: true } }),
      Note.find({ userId, createdAt: { $gte: weekAgo }, isDeleted: { $ne: true } }),
      RevisionTopic.find({ userId, lastRevised: { $gte: weekAgo } }),
      WeakTopic.find({ userId, isResolved: false }),
      StudyProfile.findOne({ userId }),
    ]);

    // Task stats
    const totalTasks     = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalMinutes   = tasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
    const totalHours     = Math.round(totalMinutes / 60 * 10) / 10;

    // Subject breakdown
    const subjectMap = {};
    tasks.filter(t => t.completed && t.subject).forEach(t => {
      subjectMap[t.subject] = (subjectMap[t.subject] || 0) + t.duration;
    });
    const subjectBreakdown = Object.entries(subjectMap)
      .map(([name, mins]) => ({ name, hours: Math.round(mins / 60 * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours);

    // Quiz stats
    const allAttempts = quizzes.flatMap(q => q.attempts || []);
    const avgQuizScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    // Topics completed (unique completed task topics)
    const topicsCompleted = [...new Set(tasks.filter(t => t.completed).map(t => t.topic))].length;

    // Daily activity (hours per day this week)
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayMins = tasks.filter(t => t.date === dateStr && t.completed).reduce((s, t) => s + t.duration, 0);
      dailyActivity.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: dateStr,
        hours: Math.round(dayMins / 60 * 10) / 10,
        tasks: tasks.filter(t => t.date === dateStr && t.completed).length,
      });
    }

    // Streak
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const hadActivity = tasks.some(t => t.date === dateStr && t.completed) ||
        notes.some(n => n.createdAt.toISOString().slice(0, 10) === dateStr);
      if (hadActivity) streak++;
      else if (i > 0) break;
    }

    // Next week priorities
    const nextPriorities = [];
    if (weakTopics.length > 0) nextPriorities.push(`Practice weak topics: ${weakTopics.slice(0, 2).map(w => w.topic).join(', ')}`);
    if (profile?.subjects?.length) nextPriorities.push(`Continue studying ${profile.subjects[0].name}`);
    if (revisions.length < 3) nextPriorities.push('Schedule more revision sessions');

    res.json({
      period: { from: weekStart, to: weekEnd },
      studyTime: { totalMinutes, totalHours },
      tasks: { completed: completedTasks, total: totalTasks, completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 },
      topicsCompleted,
      quizzes: { taken: quizzes.length, avgScore: avgQuizScore, attempts: allAttempts.length },
      notes: { created: notes.length },
      revisions: { completed: revisions.length },
      weakTopics: weakTopics.length,
      streak,
      subjectBreakdown,
      dailyActivity,
      nextPriorities,
      strongestSubject: subjectBreakdown[0]?.name || null,
      mostWeakTopic: weakTopics[0]?.topic || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
