import express from 'express';
import {
  getUsers,
  verifyUser,
  rejectUser,
  getAuditLogs,
  resetDemoData,
  exportRequestsCsv,
} from '../controllers/adminController.js';
import { flagRequest } from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes enforce authentication
router.use(protect);

// User directory (NGO and Admin coordination)
router.get('/users', authorize('admin', 'ngo'), getUsers);

// Privileged Administrative Desk Operations (Strictly Admin only)
router.use(authorize('admin'));
router.patch('/users/:id/verify', verifyUser);
router.patch('/users/:id/reject', rejectUser);

// Audit trail
router.get('/audit-logs', getAuditLogs);

// CSV Data Export
router.get('/export/csv', exportRequestsCsv);

// Moderation
router.patch('/requests/:id/flag', flagRequest);

// Development demo dataset reset
router.post('/reset-demo-data', resetDemoData);

export default router;
