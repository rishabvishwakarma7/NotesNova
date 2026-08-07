import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import {
  getUpiConfig,
  getPremiumStatus,
  submitPremiumRequest,
  getAdminPremiumRequests,
  approvePremiumRequest,
  rejectPremiumRequest,
  grantPremium,
  revokePremium,
} from '../controllers/premiumController.js';

const router = Router();

// User routes
router.get('/upi-config',   getUpiConfig);
router.get('/status',       requireAuth, getPremiumStatus);
router.post('/request',     requireAuth, submitPremiumRequest);

// Admin routes
router.get('/admin/requests',           requireAdmin, getAdminPremiumRequests);
router.patch('/admin/requests/:id/approve', requireAdmin, approvePremiumRequest);
router.patch('/admin/requests/:id/reject',  requireAdmin, rejectPremiumRequest);
router.post('/admin/grant/:userId',     requireAdmin, grantPremium);
router.post('/admin/revoke/:userId',    requireAdmin, revokePremium);

export default router;
