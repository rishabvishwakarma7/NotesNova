import { Router } from 'express';
import { syncUser, getUser } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Sync user to database (called after sign-up/sign-in from client)
router.post('/sync', syncUser);

// Get user profile (requires auth)
router.get('/profile', requireAuth, getUser);

export default router;
