import StudySession from '../models/StudySession.js';

// Log a completed Pomodoro study session
export const logPomodoroSession = async (req, res) => {
  try {
    const { durationMinutes = 25, subject = '', notes = '' } = req.body;
    const userId = req.userId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessionDoc = await StudySession.findOneAndUpdate(
      { userId, date: today },
      {
        $inc: { minutesStudied: Number(durationMinutes) },
        $push: {
          pomodoroSessions: {
            durationMinutes: Number(durationMinutes),
            completedAt: new Date(),
            subject,
            notes,
          },
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      message: 'Pomodoro session recorded successfully',
      minutesStudiedToday: sessionDoc.minutesStudied,
      totalSessionsToday: sessionDoc.pomodoroSessions.length,
      session: sessionDoc.pomodoroSessions[sessionDoc.pomodoroSessions.length - 1],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Pomodoro study statistics
export const getPomodoroStats = async (req, res) => {
  try {
    const userId = req.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [todayDoc, recentSessions] = await Promise.all([
      StudySession.findOne({ userId, date: today }),
      StudySession.find({ userId, date: { $gte: sevenDaysAgo } }).sort({ date: -1 }),
    ]);

    const totalMinutes7Days = recentSessions.reduce((sum, s) => sum + s.minutesStudied, 0);
    const totalSessions7Days = recentSessions.reduce((sum, s) => sum + (s.pomodoroSessions?.length || 0), 0);

    res.json({
      today: {
        minutesStudied: todayDoc?.minutesStudied || 0,
        completedSessions: todayDoc?.pomodoroSessions?.length || 0,
        sessions: todayDoc?.pomodoroSessions || [],
      },
      past7Days: {
        totalMinutes: totalMinutes7Days,
        totalSessions: totalSessions7Days,
        dailyAverageMinutes: Math.round(totalMinutes7Days / 7),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
