import express from 'express';
import crypto from 'crypto';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect, csrfProtection } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Public auth endpoints with brute-force rate limiting
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

// Protected current user endpoint
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/demo-switch
 * @desc    Authenticate as one of the 4 verified demo personas in development mode
 * @access  Public (Development only - blocked in production)
 */
router.post('/demo-switch', async (req, res, next) => {
  // STRICT SECURITY GUARD: Never allow demo role switcher in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Demo role switching is permanently disabled in production environments.',
    });
  }

  const { role } = req.body;
  const validRoles = ['citizen', 'volunteer', 'ngo', 'admin'];

  if (!role || !validRoles.includes(role.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid demo role: citizen, volunteer, ngo, or admin.',
    });
  }

  // Pre-configured email map matching frontend mock personas
  const roleEmailMap = {
    citizen: 'rahul.sharma@example.com',
    volunteer: 'priya.mehta@example.com',
    ngo: 'contact@helpinghands.org',
    admin: 'admin@resqconnect.org',
  };

  const targetEmail = roleEmailMap[role.toLowerCase()];

  try {
    const user = await User.findOne({ email: targetEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Demo account for role '${role}' was not found. Please run the database seed script (npm run seed).`,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    const cookieExpiry = 7 * 24 * 60 * 60 * 1000;
    res.cookie('resq_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: cookieExpiry,
    });

    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: cookieExpiry,
    });

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
      message: `Authenticated as demo persona: ${user.name} (${user.role})`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
