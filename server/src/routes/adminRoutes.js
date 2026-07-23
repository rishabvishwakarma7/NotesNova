import { Router } from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getAdminStats, getAdminUsers, getAdminActivity, getAdminUserDetail, getAdminChats } from '../controllers/adminController.js';

const router = Router();

router.use(requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.get('/users/:userId', getAdminUserDetail);
router.get('/activity', getAdminActivity);
router.get('/chats', getAdminChats);

export default router;
