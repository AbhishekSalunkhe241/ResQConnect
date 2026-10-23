import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes: verifies JWT from HttpOnly cookie or Authorization Bearer header
 */
export const protect = async (req, res, next) => {
  let token = null;

  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies.resq_token) {
    token = req.cookies.resq_token;
  } else if (req.signedCookies && req.signedCookies.resq_token) {
    token = req.signedCookies.resq_token;
  }

  // 2. Fallback to Authorization: Bearer <token>
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please log in to access this resource.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch live user from database (never trust token payload alone for current status/role)
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.',
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles Allowed roles ('citizen', 'volunteer', 'ngo', 'admin')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before checking permissions.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' is not authorized to perform this action.`,
      });
    }

    next();
  };
};

/**
 * Restricts unverified volunteer or NGO accounts from privileged operations
 */
export const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
  }

  // Citizens and Admins are not subject to partner verification
  if (req.user.role === 'citizen' || req.user.role === 'admin') {
    return next();
  }

  if (!req.user.verified) {
    return res.status(403).json({
      success: false,
      message:
        'Your account is pending verification by the administration desk. Access to this operational feature is restricted.',
    });
  }

  next();
};

/**
 * Double-submit cookie CSRF validation for cookie-authenticated state-changing requests
 */
export const csrfProtection = (req, res, next) => {
  // Safe HTTP methods don't modify state
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // If request uses Bearer token authorization header, CSRF is not applicable
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }

  // If using cookies, check that XSRF token header matches cookie
  const cookieXsrf = req.cookies ? req.cookies['XSRF-TOKEN'] : null;
  const headerXsrf = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];

  if (cookieXsrf && (!headerXsrf || cookieXsrf !== headerXsrf)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token for cookie-based session.',
    });
  }

  next();
};
