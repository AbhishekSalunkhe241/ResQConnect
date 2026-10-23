import express from 'express';
import { getResources, createResource, updateResource } from '../controllers/resourceController.js';
import { protect, authorize, requireVerified } from '../middleware/auth.js';

const router = express.Router();

// GET /api/resources is accessible publicly or authenticated
router.get('/', getResources);

// Protected inventory modifications (NGO, Admin)
router.post('/', protect, authorize('ngo', 'admin'), requireVerified, createResource);
router.patch('/:id', protect, authorize('ngo', 'admin'), requireVerified, updateResource);

export default router;
