import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { exportAsMarkdown, exportAsText } from '../controllers/exportController.js';

const router = Router();

router.post('/markdown', requireAuth, exportAsMarkdown);
router.post('/text', requireAuth, exportAsText);

export default router;
