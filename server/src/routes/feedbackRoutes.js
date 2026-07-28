import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { submitFeedback, getAllFeedback, updateFeedbackStatus, deleteFeedback } from '../controllers/feedbackController.js';

const router = Router();

// Public — any logged-in user can submit
router.post('/', requireAuth, submitFeedback);

// Admin only
router.get('/admin',        requireAdmin, getAllFeedback);
router.patch('/admin/:id',  requireAdmin, updateFeedbackStatus);
router.delete('/admin/:id', requireAdmin, deleteFeedback);

export default router;
