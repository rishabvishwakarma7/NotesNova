import { generateTextWithProvider } from '../config/aiProvider.js';
import Quiz from '../models/Quiz.js';
import WeakTopic from '../models/WeakTopic.js';

export const generateQuiz = async (req, res) => {
  try {
    const { topic, subject = '', questionCount = 10, difficulty = 'medium', provider = 'groq' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const difficultyDesc = {
      easy: 'basic and straightforward, suitable for beginners',
      medium: 'moderate difficulty, testing good understanding',
      hard: 'challenging and tricky, testing deep knowledge and application',
    };

    const subjectCtx = subject ? ` in the context of ${subject}` : '';

    const systemPrompt = `You are NoteNova AI, a quiz generator. Generate exactly ${questionCount} multiple choice questions that are ${difficultyDesc[difficulty] || difficultyDesc.medium}. 
          
You MUST respond with valid JSON only, no markdown, no code blocks. Use this exact format:
{
  "title": "Quiz: <topic>",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is the 0-based index of the correct option
- Every question must have a clear, educational explanation
- Questions should progressively cover different aspects of the topic`;

    const userPrompt = `Generate a ${difficulty} quiz about: ${topic}${subjectCtx}`;

    let content = await generateTextWithProvider(systemPrompt, userPrompt, provider);
    content = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return res.status(500).json({ error: 'Failed to parse quiz data from AI. Please try again.' });
    }

    const quiz = await Quiz.create({
      userId: req.userId,
      title: parsed.title || `Quiz: ${topic}`,
      subject,
      difficulty,
      questions: parsed.questions || [],
    });

    res.status(201).json(quiz);
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

    let score = 0;
    const wrongQuestions = [];

    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
      } else {
        wrongQuestions.push({
          topic: quiz.title.replace(/^Quiz:\s*/i, ''),
          question: q.question,
          userAnswer: q.options[answers[i]] ?? 'No answer',
          correctAnswer: q.options[q.correctAnswer],
          explanation: q.explanation || '',
          quizId: quiz._id,
          accuracy: 0,
        });
      }
    });

    quiz.attempts.push({
      score,
      total: quiz.questions.length,
      answers,
      completedAt: new Date(),
    });
    await quiz.save();

    // Auto-record weak topics when accuracy < 70%
    const accuracy = Math.round((score / quiz.questions.length) * 100);
    if (wrongQuestions.length > 0 && accuracy < 70 && quiz.subject) {
      try {
        // Group mistakes by topic (use quiz title as topic)
        const topic = quiz.title.replace(/^Quiz:\s*/i, '');
        const existing = await WeakTopic.findOne({
          userId: req.userId,
          subject: quiz.subject,
          topic,
        });
        if (existing) {
          existing.missCount += wrongQuestions.length;
          existing.quizAccuracy = Math.round((existing.quizAccuracy + accuracy) / 2);
          existing.lastDetected = new Date();
          existing.isResolved = false;
          wrongQuestions.forEach(m => existing.mistakes.push({ ...m, date: new Date() }));
          await existing.save();
        } else {
          await WeakTopic.create({
            userId: req.userId,
            subject: quiz.subject,
            topic,
            quizAccuracy: accuracy,
            missCount: wrongQuestions.length,
            mistakes: wrongQuestions.map(m => ({ ...m, date: new Date() })),
          });
        }
      } catch (err) {
        console.error('WeakTopic recording error:', err);
      }
    }

    res.json({
      score,
      total: quiz.questions.length,
      accuracy,
      weakTopicRecorded: wrongQuestions.length > 0 && accuracy < 70,
      attempt: quiz.attempts[quiz.attempts.length - 1],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.userId, isDeleted: { $ne: true } })
      .select('title subject difficulty questions attempts createdAt')
      .sort({ createdAt: -1 });

    const mapped = quizzes.map((q) => ({
      _id: q._id,
      title: q.title,
      subject: q.subject,
      difficulty: q.difficulty,
      questionCount: q.questions.length,
      attemptCount: q.attempts.length,
      bestScore: q.attempts.length > 0
        ? Math.max(...q.attempts.map((a) => Math.round((a.score / a.total) * 100)))
        : null,
      lastAttempt: q.attempts.length > 0 ? q.attempts[q.attempts.length - 1].completedAt : null,
      createdAt: q.createdAt,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, userId: req.userId, isDeleted: { $ne: true } });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Soft delete
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    res.json({ message: 'Quiz moved to trash', quizId: quiz._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuizStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.userId, isDeleted: { $ne: true } }).select('attempts difficulty');
    const totalQuizzes = quizzes.length;
    const allAttempts = quizzes.flatMap((q) => q.attempts);
    const totalAttempts = allAttempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + (a.score / a.total) * 100, 0) / totalAttempts)
      : 0;
    const bestScore = totalAttempts > 0
      ? Math.round(Math.max(...allAttempts.map((a) => (a.score / a.total) * 100)))
      : 0;

    res.json({ totalQuizzes, totalAttempts, avgScore, bestScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
