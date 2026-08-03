import StudyProfile from '../models/StudyProfile.js';
import DailyTask from '../models/DailyTask.js';
import WeakTopic from '../models/WeakTopic.js';
import Note from '../models/Note.js';
import Quiz from '../models/Quiz.js';
import RevisionTopic from '../models/RevisionTopic.js';
import { generateTextWithProvider } from '../config/aiProvider.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysUntil(date) {
  if (!date) return null;
  return Math.max(0, Math.ceil((new Date(date) - new Date()) / 86400000));
}

const GOAL_LABELS = {
  pass: 'Pass the exam',
  score60: 'Score 60+ marks',
  score75: 'Score 75+ marks',
  maximize: 'Score maximum marks',
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const getProfile = async (req, res) => {
  try {
    let profile = await StudyProfile.findOne({ userId: req.userId });
    if (!profile) {
      profile = await StudyProfile.create({ userId: req.userId });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowed = [
      'course','university','branch','semester','examDate','examName',
      'subjects','dailyStudyTime','studyGoal','prepLevel','onboardingDone',
    ];
    const update = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });

    const profile = await StudyProfile.findOneAndUpdate(
      { userId: req.userId },
      update,
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Today's Study Plan ──────────────────────────────────────────────────────

export const getTodayPlan = async (req, res) => {
  try {
    const today = todayStr();
    let tasks = await DailyTask.find({ userId: req.userId, date: today }).sort({ priority: 1 });

    // Auto-generate if none exist for today
    if (tasks.length === 0) {
      tasks = await generateDailyTasks(req.userId, today);
    }

    const totalMinutes = tasks.reduce((s, t) => s + t.duration, 0);
    const completedMinutes = tasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
    const completedCount = tasks.filter(t => t.completed).length;

    res.json({
      date: today,
      tasks,
      totalMinutes,
      completedMinutes,
      completedCount,
      totalCount: tasks.length,
      progressPct: tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const completeTask = async (req, res) => {
  try {
    const task = await DailyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Update profile total study minutes
    await StudyProfile.findOneAndUpdate(
      { userId: req.userId },
      { $inc: { totalStudyMinutes: task.duration } }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const skipTask = async (req, res) => {
  try {
    const task = await DailyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { skipped: true },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const rescheduleTask = async (req, res) => {
  try {
    const { newDate } = req.body;
    const task = await DailyTask.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { date: newDate || getTomorrowStr(), rescheduled: true, skipped: false },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addManualTask = async (req, res) => {
  try {
    const today = todayStr();
    const task = await DailyTask.create({
      userId: req.userId,
      date: req.body.date || today,
      subject: req.body.subject || '',
      unit: req.body.unit || '',
      topic: req.body.topic,
      taskType: req.body.taskType || 'learn',
      duration: req.body.duration || 25,
      priority: req.body.priority || 'medium',
      difficulty: req.body.difficulty || 'medium',
      sourceType: 'manual',
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── AI Roadmap Generation ───────────────────────────────────────────────────

export const generateRoadmap = async (req, res) => {
  try {
    const profile = await StudyProfile.findOne({ userId: req.userId });
    if (!profile || profile.subjects.length === 0) {
      return res.status(400).json({ error: 'Please complete your study profile first.' });
    }

    const days = daysUntil(profile.examDate);
    const subjectNames = profile.subjects.map(s => s.name).join(', ');
    const goalLabel = GOAL_LABELS[profile.studyGoal] || profile.studyGoal;
    const dailyHours = Math.round(profile.dailyStudyTime / 60 * 10) / 10;

    const systemPrompt = `You are NoteNova AI, an academic study planner. Generate a structured JSON study roadmap.`;
    const userPrompt = `
Student Profile:
- Subjects: ${subjectNames}
- Exam Date: ${profile.examDate ? profile.examDate.toDateString() : 'Not set'}
- Days Remaining: ${days ?? 'Unknown'}
- Daily Study Time: ${dailyHours} hours
- Goal: ${goalLabel}
- Prep Level: ${profile.prepLevel}

Return a JSON object with this exact structure:
{
  "overview": "2-sentence personalized study strategy",
  "examReadiness": 25,
  "onTrackStatus": "on_track",
  "subjects": [
    {
      "name": "Subject Name",
      "totalTopics": 20,
      "completedTopics": 0,
      "estimatedHours": 15,
      "priority": "high",
      "units": [
        {
          "name": "Unit Name",
          "topics": ["Topic 1", "Topic 2"],
          "estimatedHours": 3,
          "status": "not_started"
        }
      ]
    }
  ],
  "weeklyPlan": [
    { "week": 1, "focus": "Subject Name", "goals": ["Complete Unit 1", "Take quiz on Unit 1"] }
  ],
  "recommendation": "Most important thing to do first"
}

Rules:
- examReadiness is 0-100 based on prep level
- onTrackStatus is one of: ahead, on_track, slightly_behind, significantly_behind
- Return ONLY the JSON object, no markdown, no explanation`;

    const raw = await generateTextWithProvider(systemPrompt, userPrompt, 'groq');

    // Extract JSON robustly
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI did not return valid JSON');
    const roadmap = JSON.parse(jsonMatch[0]);

    // Store roadmap overview in profile
    await StudyProfile.findOneAndUpdate(
      { userId: req.userId },
      { $set: { 'roadmapGeneratedAt': new Date() } }
    );

    res.json({ roadmap, profile });
  } catch (err) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ─── Exam Readiness Score ────────────────────────────────────────────────────

export const getReadiness = async (req, res) => {
  try {
    const [profile, revTopics, quizzes, weakTopics] = await Promise.all([
      StudyProfile.findOne({ userId: req.userId }),
      RevisionTopic.find({ userId: req.userId }),
      Quiz.find({ userId: req.userId }),
      WeakTopic.find({ userId: req.userId, isResolved: false }),
    ]);

    if (!profile) return res.json({ score: 0, components: {}, status: 'no_profile' });

    const days = daysUntil(profile.examDate);

    // Component scores (0-100)
    const masteredTopics = revTopics.filter(t => t.confidence >= 4).length;
    const totalTracked = revTopics.length;
    const knowledgeScore = totalTracked > 0 ? Math.round((masteredTopics / totalTracked) * 100) : 20;

    const allAttempts = quizzes.flatMap(q => q.attempts || []);
    const practiceScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    const dueRevisions = revTopics.filter(t => t.nextRevision && new Date(t.nextRevision) <= new Date()).length;
    const revisionScore = totalTracked > 0
      ? Math.max(0, 100 - Math.round((dueRevisions / totalTracked) * 100))
      : 50;

    const weakPenalty = Math.min(40, weakTopics.length * 8);
    const baseScore = prepLevelBase(profile.prepLevel);

    const overall = Math.round(
      (knowledgeScore * 0.35 + practiceScore * 0.35 + revisionScore * 0.3) * 0.7 +
      baseScore * 0.3 - weakPenalty * 0.1
    );

    const score = Math.min(100, Math.max(0, overall));

    let status = 'on_track';
    if (days !== null) {
      const expectedByNow = getExpectedProgress(profile.prepLevel, days, profile.examDate);
      if (score >= expectedByNow + 10) status = 'ahead';
      else if (score >= expectedByNow - 10) status = 'on_track';
      else if (score >= expectedByNow - 25) status = 'slightly_behind';
      else status = 'significantly_behind';
    }

    res.json({
      score,
      status,
      daysUntilExam: days,
      components: {
        knowledge: knowledgeScore,
        practice: practiceScore,
        revision: revisionScore,
      },
      weakTopicsCount: weakTopics.length,
      recommendation: getReadinessRecommendation(score, status, weakTopics),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Weak Topics ────────────────────────────────────────────────────────────

export const getWeakTopics = async (req, res) => {
  try {
    const topics = await WeakTopic.find({ userId: req.userId, isResolved: false })
      .sort({ missCount: -1, quizAccuracy: 1 })
      .limit(20);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveWeakTopic = async (req, res) => {
  try {
    const topic = await WeakTopic.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isResolved: true },
      { new: true }
    );
    res.json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Record weak topic from quiz result
export const recordWeakTopics = async (req, res) => {
  try {
    const { subject, mistakes } = req.body;
    // mistakes: [{ topic, question, userAnswer, correctAnswer, explanation, quizId }]
    for (const m of (mistakes || [])) {
      const existing = await WeakTopic.findOne({ userId: req.userId, subject, topic: m.topic });
      if (existing) {
        existing.missCount += 1;
        existing.quizAccuracy = Math.round((existing.quizAccuracy + (m.accuracy ?? 0)) / 2);
        existing.lastDetected = new Date();
        if (m.question) existing.mistakes.push({ ...m, date: new Date() });
        await existing.save();
      } else {
        await WeakTopic.create({
          userId: req.userId,
          subject,
          topic: m.topic,
          quizAccuracy: m.accuracy ?? 0,
          missCount: 1,
          mistakes: m.question ? [{ ...m, date: new Date() }] : [],
        });
      }
    }
    res.json({ recorded: mistakes?.length ?? 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Next Recommended Action ─────────────────────────────────────────────────

export const getNextAction = async (req, res) => {
  try {
    const [profile, todayTasks, revDue, weakTopics] = await Promise.all([
      StudyProfile.findOne({ userId: req.userId }),
      DailyTask.find({ userId: req.userId, date: todayStr(), completed: false, skipped: false }),
      RevisionTopic.find({ userId: req.userId, nextRevision: { $lte: new Date() } }).limit(3),
      WeakTopic.find({ userId: req.userId, isResolved: false }).sort({ missCount: -1 }).limit(3),
    ]);

    // Priority 1: incomplete today's task
    if (todayTasks.length > 0) {
      const t = todayTasks[0];
      return res.json({
        type: 'today_task',
        title: t.topic,
        reason: `This is in your study plan for today (${t.subject || 'General'})`,
        duration: t.duration,
        href: '/dashboard/journey',
        subject: t.subject,
        taskId: t._id,
      });
    }

    // Priority 2: due revision
    if (revDue.length > 0) {
      const r = revDue[0];
      return res.json({
        type: 'revision',
        title: `Revise: ${r.topic}`,
        reason: `This topic is scheduled for revision today (confidence: ${r.confidence}/5)`,
        duration: 15,
        href: '/dashboard/revision',
        subject: r.subject,
      });
    }

    // Priority 3: weak topic
    if (weakTopics.length > 0) {
      const w = weakTopics[0];
      return res.json({
        type: 'weak_topic',
        title: `Practice: ${w.topic}`,
        reason: `You got ${w.quizAccuracy}% accuracy on this topic — it needs more practice`,
        duration: 20,
        href: `/dashboard/quiz`,
        subject: w.subject,
      });
    }

    // Default: generate notes or take quiz
    const subject = profile?.subjects?.[0]?.name || 'your next subject';
    return res.json({
      type: 'generate',
      title: `Generate notes for ${subject}`,
      reason: 'Keep building your knowledge library',
      duration: 30,
      href: '/dashboard/generate',
      subject,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Journey Dashboard Summary ───────────────────────────────────────────────

export const getJourneySummary = async (req, res) => {
  try {
    const today = todayStr();
    const [profile, todayTasks, revDue, weakTopics, quizzes] = await Promise.all([
      StudyProfile.findOne({ userId: req.userId }),
      DailyTask.find({ userId: req.userId, date: today }),
      RevisionTopic.find({ userId: req.userId, nextRevision: { $lte: new Date() } }),
      WeakTopic.find({ userId: req.userId, isResolved: false }),
      Quiz.find({ userId: req.userId }).select('attempts').lean(),
    ]);

    const completedToday = todayTasks.filter(t => t.completed).length;
    const totalToday = todayTasks.length;
    const minutesCompleted = todayTasks.filter(t => t.completed).reduce((s, t) => s + t.duration, 0);
    const minutesTotal = todayTasks.reduce((s, t) => s + t.duration, 0);

    const allAttempts = quizzes.flatMap(q => q.attempts || []);
    const avgQuizScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / allAttempts.length)
      : 0;

    const days = daysUntil(profile?.examDate);

    res.json({
      hasProfile: !!profile?.onboardingDone,
      examDate: profile?.examDate || null,
      daysUntilExam: days,
      examName: profile?.examName || '',
      subjects: profile?.subjects || [],
      dailyStudyTime: profile?.dailyStudyTime || 120,
      studyGoal: profile?.studyGoal || 'score75',
      today: {
        completedTasks: completedToday,
        totalTasks: totalToday,
        minutesCompleted,
        minutesTotal,
        progressPct: totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0,
      },
      dueRevisions: revDue.length,
      weakTopicsCount: weakTopics.length,
      avgQuizScore,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Private helpers ─────────────────────────────────────────────────────────

async function generateDailyTasks(userId, dateStr) {
  const profile = await StudyProfile.findOne({ userId });
  if (!profile || !profile.onboardingDone || profile.subjects.length === 0) return [];

  try {
    const subjectNames = profile.subjects.map(s => s.name).join(', ');
    const dailyMins = profile.dailyStudyTime;
    const days = daysUntil(profile.examDate);

    const systemPrompt = `You are NoteNova AI. Generate a focused daily study task list.`;
    const userPrompt = `
Student: Subjects: ${subjectNames}, Daily time: ${dailyMins} minutes, Days to exam: ${days ?? 'unknown'}, Goal: ${profile.studyGoal}, Prep: ${profile.prepLevel}
Date: ${dateStr}

Return a JSON array of 4-6 specific tasks:
[
  {
    "topic": "Specific topic name",
    "subject": "Subject name",
    "unit": "Unit name if applicable",
    "taskType": "learn|practice|revise|quiz",
    "duration": 25,
    "priority": "high|medium|low",
    "difficulty": "easy|medium|hard"
  }
]
Rules:
- Total duration should be ${dailyMins} minutes
- Be specific: not "Study Unit 3" but "Study CRC checksums and error detection methods"
- Mix task types: some learn, some practice, some revise
- Higher priority for topics closer to exam
- Return ONLY the JSON array`;

    const raw = await generateTextWithProvider(systemPrompt, userPrompt, 'groq');
    const arrMatch = raw.match(/\[[\s\S]*\]/);
    if (!arrMatch) return [];

    const parsed = JSON.parse(arrMatch[0]);
    const tasks = await DailyTask.insertMany(
      parsed.slice(0, 8).map(t => ({
        userId,
        date: dateStr,
        topic: t.topic || 'Study session',
        subject: t.subject || '',
        unit: t.unit || '',
        taskType: t.taskType || 'learn',
        duration: t.duration || 25,
        priority: t.priority || 'medium',
        difficulty: t.difficulty || 'medium',
        sourceType: 'ai_generated',
      }))
    );
    return tasks;
  } catch {
    return [];
  }
}

function prepLevelBase(level) {
  const map = { not_started: 5, beginner: 15, partial: 40, mostly: 65 };
  return map[level] || 15;
}

function getExpectedProgress(prepLevel, daysLeft, examDate) {
  if (!examDate) return 50;
  const totalDays = Math.ceil((new Date(examDate) - new Date(new Date().setDate(new Date().getDate() + daysLeft))) / 86400000) + daysLeft;
  const elapsed = totalDays - daysLeft;
  const baseProgress = prepLevelBase(prepLevel);
  return Math.min(95, baseProgress + Math.round((elapsed / Math.max(totalDays, 1)) * (95 - baseProgress)));
}

function getReadinessRecommendation(score, status, weakTopics) {
  if (weakTopics.length > 0) {
    return `Focus on your weak areas — especially "${weakTopics[0]?.topic}". Practice more questions there.`;
  }
  if (status === 'significantly_behind') return 'You need to increase your daily study time. Consider adding 30-45 minutes per day.';
  if (status === 'slightly_behind') return 'You are slightly behind. Add one extra study session this week to catch up.';
  if (status === 'ahead') return 'You are ahead of schedule. Start revising topics you studied earlier.';
  if (score < 40) return 'Focus on completing your core syllabus first, then add practice questions.';
  if (score < 70) return 'Good progress. Add more practice questions and PYQ solving to strengthen weak areas.';
  return 'Excellent preparation. Focus on revision and solving PYQs for maximum marks.';
}

function getTomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
