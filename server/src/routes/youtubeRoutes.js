import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { generateVideoNotes } from '../controllers/youtubeController.js';

const router = Router();

router.post('/notes', requireAuth, aiLimiter, generateVideoNotes);

export default router;
