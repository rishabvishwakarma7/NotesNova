import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTopics, addTopic, markRevised, updateTopic, deleteTopic, getStats } from '../controllers/revisionController.js';

const router = Router();

router.get('/stats', requireAuth, getStats);
router.get('/', requireAuth, getTopics);
router.post('/', requireAuth, addTopic);
router.patch('/:id/revise', requireAuth, markRevised);
router.put('/:id', requireAuth, updateTopic);
router.delete('/:id', requireAuth, deleteTopic);

export default router;
