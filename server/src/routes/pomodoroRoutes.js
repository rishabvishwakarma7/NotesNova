import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { logPomodoroSession, getPomodoroStats } from '../controllers/pomodoroController.js';

const router = Router();

router.post('/session', requireAuth, logPomodoroSession);
router.get('/stats', requireAuth, getPomodoroStats);

export default router;
