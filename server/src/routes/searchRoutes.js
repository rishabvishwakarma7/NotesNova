import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { globalSearch } from '../controllers/searchController.js';

const router = Router();

router.get('/', requireAuth, globalSearch);

export default router;
