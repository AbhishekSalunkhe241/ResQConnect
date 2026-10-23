import express from 'express';
import {
  getRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  claimVolunteerTask,
  addVolunteerCheckIn,
  completeVolunteerTask,
  assignVolunteerToRequest,
  allocateResourceToRequest,
  flagRequest,
} from '../controllers/requestController.js';
import { protect, authorize, requireVerified } from '../middleware/auth.js';

const router = express.Router();

// All request routes require authentication
router.use(protect);

// Requests listing & creation
router.get('/', getRequests);
router.post('/', authorize('citizen'), createRequest);

// Single request detail
router.get('/:id', getRequestById);

// Status transition (NGO, Admin)
router.patch('/:id/status', authorize('ngo', 'admin'), requireVerified, updateRequestStatus);

// Volunteer workflow
router.post('/:id/volunteer/claim', authorize('volunteer'), requireVerified, claimVolunteerTask);
router.post('/:id/volunteer/checkin', authorize('volunteer'), requireVerified, addVolunteerCheckIn);
router.post('/:id/volunteer/complete', authorize('volunteer'), requireVerified, completeVolunteerTask);

// NGO management operations
router.post('/:id/ngo/assign', authorize('ngo', 'admin'), requireVerified, assignVolunteerToRequest);
router.post('/:id/ngo/allocate', authorize('ngo', 'admin'), requireVerified, allocateResourceToRequest);

// Admin moderation
router.patch('/:id/flag', authorize('admin'), flagRequest);

export default router;
