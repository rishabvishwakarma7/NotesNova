import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { generateNotes, aiTransform, getNotes, getNote, createNote, updateNote, deleteNote } from '../controllers/notesController.js';

const router = Router();

router.post('/generate', requireAuth, aiLimiter, generateNotes);
router.post('/transform', requireAuth, aiLimiter, aiTransform);
router.get('/', requireAuth, getNotes);
router.get('/:id', requireAuth, getNote);
router.post('/', requireAuth, createNote);
router.put('/:id', requireAuth, updateNote);
router.delete('/:id', requireAuth, deleteNote);

export default router;
