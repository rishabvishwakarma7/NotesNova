import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { streamChat, getChats, getChat, saveChat, updateChat, deleteChat } from '../controllers/chatController.js';

const router = Router();

router.post('/stream', requireAuth, aiLimiter, streamChat);
router.get('/', requireAuth, getChats);
router.get('/:id', requireAuth, getChat);
router.post('/', requireAuth, saveChat);
router.put('/:id', requireAuth, updateChat);
router.delete('/:id', requireAuth, deleteChat);

export default router;
