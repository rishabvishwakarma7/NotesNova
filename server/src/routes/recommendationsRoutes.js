import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getPersonalizedRecommendations } from '../controllers/recommendationsController.js';

const router = Router();

router.get('/', requireAuth, getPersonalizedRecommendations);

export default router;
