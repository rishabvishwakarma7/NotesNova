import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { validateEnv } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import chatRoutes from './src/routes/chatRoutes.js';
import notesRoutes from './src/routes/notesRoutes.js';
import folderRoutes from './src/routes/folderRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import webhookRoutes from './src/routes/webhookRoutes.js';
import youtubeRoutes from './src/routes/youtubeRoutes.js';
import quizRoutes from './src/routes/quizRoutes.js';
import plannerRoutes from './src/routes/plannerRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import searchRoutes from './src/routes/searchRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import revisionRoutes from './src/routes/revisionRoutes.js';
import pyqRoutes from './src/routes/pyqRoutes.js';
import feedbackRoutes from './src/routes/feedbackRoutes.js';
import trashRoutes from './src/routes/trashRoutes.js';
import pomodoroRoutes from './src/routes/pomodoroRoutes.js';
import exportRoutes from './src/routes/exportRoutes.js';
import recommendationsRoutes from './src/routes/recommendationsRoutes.js';
import journeyRoutes from './src/routes/journeyRoutes.js';
import weeklyReportRoutes from './src/routes/weeklyReportRoutes.js';
import premiumRoutes from './src/routes/premiumRoutes.js';

// Validate environment startup config
validateEnv();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/chat', chatRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/trash', trashRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/journey', journeyRoutes);
app.use('/api/weekly-report', weeklyReportRoutes);
app.use('/api/premium', premiumRoutes);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 NoteNova API running on port ${PORT}`);

    // Self-ping every 14 minutes to prevent Railway free-tier sleep (sleeps after 15min idle)
    if (process.env.NODE_ENV === 'production' && process.env.RAILWAY_PUBLIC_DOMAIN) {
      const selfUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/api/health`;
      setInterval(() => {
        import('https').then(({ default: https }) => {
          https.get(selfUrl, (res) => {
            console.log(`[Keep-alive] Pinged ${selfUrl} → ${res.statusCode}`);
          }).on('error', (e) => {
            console.warn('[Keep-alive] Ping failed:', e.message);
          });
        }).catch(() => {});
      }, 14 * 60 * 1000); // every 14 minutes
    }
  });
};

start().catch(console.error);
