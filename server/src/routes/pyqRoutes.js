import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { generatePYQ, generatePYQFromPDF, getPYQs, getPYQ, deletePYQ } from '../controllers/pyqController.js';

// Store PDF in memory (no disk needed on Railway)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

const router = Router();

router.post('/generate',     requireAuth, aiLimiter, generatePYQ);
router.post('/generate-pdf', requireAuth, aiLimiter, upload.single('pdf'), generatePYQFromPDF);
router.get('/',              requireAuth, getPYQs);
router.get('/:id',           requireAuth, getPYQ);
router.delete('/:id',        requireAuth, deletePYQ);

export default router;
