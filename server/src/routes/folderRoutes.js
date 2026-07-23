import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getFolders, createFolder, updateFolder, deleteFolder } from '../controllers/folderController.js';

const router = Router();

router.get('/', requireAuth, getFolders);
router.post('/', requireAuth, createFolder);
router.put('/:id', requireAuth, updateFolder);
router.delete('/:id', requireAuth, deleteFolder);

export default router;
