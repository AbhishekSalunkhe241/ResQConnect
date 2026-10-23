import express from 'express';
import { getHubs, createHub } from '../controllers/hubController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public recovery hub directory
router.get('/', getHubs);

// Protected hub creation (Admin)
router.post('/', protect, authorize('admin'), createHub);

export default router;
