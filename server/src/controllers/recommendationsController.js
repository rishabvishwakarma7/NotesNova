import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import RevisionTopic from '../models/RevisionTopic.js';
import StudyPlan from '../models/StudyPlan.js';

export const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();

    const [notes, quizzes, revisionTopics, plans] = await Promise.all([
      Note.find({ userId, isDeleted: { $ne: true } }).select('title subject noteType updatedAt').sort({ updatedAt: -1 }),
      Quiz.find({ userId, isDeleted: { $ne: true } }).select('title subject attempts difficulty'),
      RevisionTopic.find({ userId, isArchived: false, isDeleted: { $ne: true } }).select('topic subject nextRevision confidence'),
      StudyPlan.find({ userId }).select('title examDate plan'),
    ]);

    const recommendations = [];

    // 1. Overdue revisions
    const dueRevisions = revisionTopics.filter((t) => t.nextRevision && new Date(t.nextRevision) <= now);
    if (dueRevisions.length > 0) {
      recommendations.push({
        type: 'revision',
        priority: 'high',
        title: `${dueRevisions.length} Revision ${dueRevisions.length === 1 ? 'Topic' : 'Topics'} Due Today`,
        description: `Spaced repetition suggests reviewing: ${dueRevisions.slice(0, 3).map((t) => t.topic).join(', ')}.`,
        actionUrl: '/dashboard/revision',
        actionText: 'Start Review',
      });
    }

    // 2. Low quiz accuracy subjects
    const subjectScores = {};
    quizzes.forEach((q) => {
      if (q.attempts && q.attempts.length > 0) {
        const lastAttempt = q.attempts[q.attempts.length - 1];
        const scorePct = (lastAttempt.score / lastAttempt.total) * 100;
        const subj = q.subject || 'General';
        if (!subjectScores[subj]) subjectScores[subj] = [];
        subjectScores[subj].push(scorePct);
      }
    });

    const weakSubjects = Object.entries(subjectScores)
      .map(([subj, scores]) => ({
        subject: subj,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .filter((s) => s.avg < 70);

    if (weakSubjects.length > 0) {
      const weakest = weakSubjects[0];
      recommendations.push({
        type: 'quiz',
        priority: 'high',
        title: `Boost Your Knowledge in ${weakest.subject}`,
        description: `Your quiz average in ${weakest.subject} is currently ${weakest.avg}%. Practice with a new targeted quiz!`,
        actionUrl: `/dashboard/quiz?subject=${encodeURIComponent(weakest.subject)}`,
        actionText: 'Take Quiz',
      });
    }

    // 3. Upcoming Exam Plan alert
    if (plans.length > 0) {
      const upcomingPlan = plans.find((p) => new Date(p.examDate) > now);
      if (upcomingPlan) {
        const daysLeft = Math.ceil((new Date(upcomingPlan.examDate) - now) / (1000 * 60 * 60 * 24));
        const totalTasks = upcomingPlan.plan.reduce((sum, d) => sum + d.tasks.length, 0);
        const completedTasks = upcomingPlan.plan.reduce((sum, d) => sum + d.tasks.filter((t) => t.completed).length, 0);
        const pending = totalTasks - completedTasks;

        if (pending > 0) {
          recommendations.push({
            type: 'planner',
            priority: daysLeft <= 7 ? 'high' : 'medium',
            title: `${daysLeft} Days Until ${upcomingPlan.title}`,
            description: `You have ${pending} tasks remaining in your study plan.`,
            actionUrl: '/dashboard/planner',
            actionText: 'View Plan',
          });
        }
      }
    }

    // 4. Stale notes needing summary or review
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const oldNotes = notes.filter((n) => new Date(n.updatedAt) < twoWeeksAgo);
    if (oldNotes.length > 0) {
      recommendations.push({
        type: 'note',
        priority: 'low',
        title: 'Refresh Older Study Notes',
        description: `You haven't reviewed "${oldNotes[0].title}" in over 2 weeks.`,
        actionUrl: `/dashboard/notes/${oldNotes[0]._id}`,
        actionText: 'Open Note',
      });
    }

    // Default fallback recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        title: 'Generate AI Study Notes',
        description: 'Create detailed AI notes for your upcoming topics and save study time.',
        actionUrl: '/dashboard/generate',
        actionText: 'Generate Notes',
      });
    }

    res.json({ recommendations, count: recommendations.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
