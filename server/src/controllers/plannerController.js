import { generateText } from '../config/gemini.js';
import StudyPlan from '../models/StudyPlan.js';

export const generatePlan = async (req, res) => {
  try {
    const { title = 'Study Plan', examDate, subjects = [], topics = [], hoursPerDay = 4 } = req.body;

    if (!examDate) return res.status(400).json({ error: 'Exam date is required' });
    if (subjects.length === 0 && topics.length === 0) {
      return res.status(400).json({ error: 'At least one subject or topic is required' });
    }

    const exam = new Date(examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilExam = Math.max(1, Math.ceil((exam - today) / (1000 * 60 * 60 * 24)));
    const totalDays = Math.min(daysUntilExam, 60); // Cap at 60 days

    const subjectList = subjects.length > 0 ? subjects.join(', ') : 'General';
    const topicList = topics.length > 0 ? topics.join(', ') : 'As needed for the subjects';

    const systemPrompt = `You are NoteNova AI, a study planner. Create a day-by-day study plan.

You MUST respond with valid JSON only, no markdown, no code blocks. Use this exact format:
{
  "plan": [
    {
      "day": 1,
      "tasks": [
        {
          "topic": "Topic name",
          "subject": "Subject name",
          "duration": "2 hours",
          "type": "study"
        }
      ]
    }
  ]
}

Rules:
- Create exactly ${totalDays} days
- Each day should have ${hoursPerDay} hours worth of tasks
- type must be one of: "study", "practice", "revision", "break"
- Include regular revision days and short breaks
- Start with foundational topics, progress to advanced
- Last few days should focus on revision and practice
- Distribute subjects evenly across the schedule
- Keep task durations realistic (30min to 2 hours each)`;

    const userPrompt = `Create a ${totalDays}-day study plan for:
Subjects: ${subjectList}
Topics: ${topicList}
Hours per day: ${hoursPerDay}
Exam date: ${exam.toLocaleDateString()}`;

    let content = await generateText(systemPrompt, userPrompt);
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: 'Failed to parse plan from AI. Please try again.' });
    }

    // Add actual dates to each day
    const planWithDates = (parsed.plan || []).map((day, i) => ({
      ...day,
      day: i + 1,
      date: new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)),
      tasks: (day.tasks || []).map(t => ({ ...t, completed: false })),
    }));

    const plan = await StudyPlan.create({
      userId: req.userId,
      title,
      examDate: exam,
      subjects,
      topics,
      hoursPerDay,
      plan: planWithDates,
    });

    res.status(201).json(plan);
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ userId: req.userId })
      .select('title examDate subjects hoursPerDay plan createdAt')
      .sort({ createdAt: -1 });

    const mapped = plans.map(p => {
      const totalTasks = p.plan.reduce((sum, d) => sum + d.tasks.length, 0);
      const completedTasks = p.plan.reduce((sum, d) => sum + d.tasks.filter(t => t.completed).length, 0);
      return {
        _id: p._id,
        title: p.title,
        examDate: p.examDate,
        subjects: p.subjects,
        totalDays: p.plan.length,
        totalTasks,
        completedTasks,
        progress: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        createdAt: p.createdAt,
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPlan = async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { dayIndex, taskIndex } = req.params;
    const { completed } = req.body;

    const plan = await StudyPlan.findOne({ _id: req.params.id, userId: req.userId });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    if (!plan.plan[dayIndex] || !plan.plan[dayIndex].tasks[taskIndex]) {
      return res.status(404).json({ error: 'Task not found' });
    }

    plan.plan[dayIndex].tasks[taskIndex].completed = completed;
    await plan.save();
    res.json({ message: 'Task updated', completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deletePlan = async (req, res) => {
  try {
    await StudyPlan.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
