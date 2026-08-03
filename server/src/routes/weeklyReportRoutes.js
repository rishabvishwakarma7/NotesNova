import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getWeeklyReport } from '../controllers/weeklyReportController.js';

const router = express.Router();
router.use(requireAuth);
router.get('/', getWeeklyReport);

export default router;
