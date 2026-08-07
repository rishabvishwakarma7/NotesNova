import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { validateNoteGeneration, validateNoteTransform } from '../middleware/validate.js';
import {
  generateNotes,
  aiTransform,
  getNotes,
  getNote,
  createNote,
  importMarkdown,
  updateNote,
  deleteNote,
  generateCreativeNotes,
} from '../controllers/notesController.js';

const router = Router();

router.post('/generate', requireAuth, aiLimiter, validateNoteGeneration, generateNotes);
router.post('/creative', requireAuth, aiLimiter, generateCreativeNotes);
router.post('/transform', requireAuth, aiLimiter, validateNoteTransform, aiTransform);
router.post('/import/markdown', requireAuth, importMarkdown);
router.get('/', requireAuth, getNotes);
router.get('/:id', requireAuth, getNote);
router.post('/', requireAuth, createNote);
router.put('/:id', requireAuth, updateNote);
router.delete('/:id', requireAuth, deleteNote);

export default router;
