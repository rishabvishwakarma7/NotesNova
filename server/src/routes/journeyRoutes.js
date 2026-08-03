import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfile, updateProfile,
  getTodayPlan, completeTask, skipTask, rescheduleTask, addManualTask,
  generateRoadmap,
  getReadiness,
  getWeakTopics, resolveWeakTopic, recordWeakTopics,
  getNextAction,
  getJourneySummary,
} from '../controllers/journeyController.js';

const router = express.Router();

router.use(requireAuth);

// Profile
router.get('/profile',      getProfile);
router.put('/profile',      updateProfile);

// Today's plan
router.get('/today',        getTodayPlan);
router.patch('/tasks/:id/complete',  completeTask);
router.patch('/tasks/:id/skip',      skipTask);
router.patch('/tasks/:id/reschedule',rescheduleTask);
router.post('/tasks',       addManualTask);

// Roadmap
router.post('/roadmap',     generateRoadmap);

// Exam readiness
router.get('/readiness',    getReadiness);

// Weak topics
router.get('/weak-topics',         getWeakTopics);
router.patch('/weak-topics/:id/resolve', resolveWeakTopic);
router.post('/weak-topics',        recordWeakTopics);

// AI recommendation
router.get('/next-action',  getNextAction);

// Full summary for dashboard
router.get('/summary',      getJourneySummary);

export default router;
