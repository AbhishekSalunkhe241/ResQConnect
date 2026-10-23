import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Helper to generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Helper to generate CSRF token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Helper to attach authentication and CSRF cookies to response
 */
const setAuthCookies = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Primary HttpOnly Session Cookie (stores JWT)
  res.cookie('resq_token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: cookieExpiry,
  });

  // Dual-submit CSRF Token Cookie (readable by client-side JS)
  const csrfToken = generateCsrfToken();
  res.cookie('XSRF-TOKEN', csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: cookieExpiry,
  });

  return csrfToken;
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Citizen, Volunteer, or NGO)
 * @access  Public
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, location, bio, skills, regNumber, focusAreas } =
      req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const requestedRole = (role || 'citizen').toLowerCase();

    // CRITICAL SECURITY REQUIREMENT: Never allow public registration as admin
    if (requestedRole === 'admin') {
      return res.status(403).json({
        success: false,
        message:
          'Security violation: Administrative accounts cannot be registered publicly. They must be provisioned by authorized administrative processes.',
      });
    }

    if (!['citizen', 'volunteer', 'ngo'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Permitted roles are citizen, volunteer, or ngo.',
      });
    }

    // Check for existing account with same email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Prepare role-specific attributes
    const isPartner = requestedRole === 'volunteer' || requestedRole === 'ngo';

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone || '',
      role: requestedRole,
      location: location || 'Panvel, Maharashtra',
      bio: bio || '',
      verified: !isPartner, // Partners require administrative review
      pendingVerification: isPartner,
      ...(requestedRole === 'volunteer' && {
        skills: Array.isArray(skills) ? skills : [],
        status: 'Awaiting Verification',
        badge: 'Applicant',
      }),
      ...(requestedRole === 'ngo' && {
        regNumber: regNumber || '',
        focusAreas: Array.isArray(focusAreas) ? focusAreas : [],
      }),
    };

    const user = await User.create(userData);
    const token = generateToken(user._id);
    setAuthCookies(res, token);

    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT + set cookies
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Query user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);
    setAuthCookies(res, token);

    res.status(200).json({
      success: true,
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user profile
 * @access  Private (requires protect)
 */
export const getMe = async (req, res) => {
  // req.user was fetched from DB in protect middleware
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

/**
 * @route   POST /api/auth/logout
 * @desc    Log out user by clearing cookies
 * @access  Public
 */
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  res.cookie('resq_token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.cookie('XSRF-TOKEN', '', {
    httpOnly: false,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
