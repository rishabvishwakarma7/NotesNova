import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getTrashItems, restoreTrashItem, permanentDeleteItem, emptyTrash } from '../controllers/trashController.js';

const router = Router();

router.get('/', requireAuth, getTrashItems);
router.post('/:type/:id/restore', requireAuth, restoreTrashItem);
router.delete('/:type/:id', requireAuth, permanentDeleteItem);
router.delete('/empty/all', requireAuth, emptyTrash);

export default router;
