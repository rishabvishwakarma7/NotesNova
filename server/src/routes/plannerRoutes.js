import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { generatePlan, getPlans, getPlan, updateTaskStatus, deletePlan } from '../controllers/plannerController.js';

const router = Router();

router.post('/generate', requireAuth, aiLimiter, generatePlan);
router.get('/', requireAuth, getPlans);
router.get('/:id', requireAuth, getPlan);
router.patch('/:id/tasks/:dayIndex/:taskIndex', requireAuth, updateTaskStatus);
router.delete('/:id', requireAuth, deletePlan);

export default router;
