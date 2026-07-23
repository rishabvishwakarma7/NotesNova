import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { generateQuiz, submitQuiz, getQuizzes, getQuiz, deleteQuiz, getQuizStats } from '../controllers/quizController.js';

const router = Router();

router.post('/generate', requireAuth, aiLimiter, generateQuiz);
router.post('/:id/submit', requireAuth, submitQuiz);
router.get('/stats', requireAuth, getQuizStats);
router.get('/', requireAuth, getQuizzes);
router.get('/:id', requireAuth, getQuiz);
router.delete('/:id', requireAuth, deleteQuiz);

export default router;
