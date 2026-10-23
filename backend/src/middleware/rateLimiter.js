import rateLimit from 'express-rate-limit';

/**
 * Authentication rate limiter to mitigate brute-force and credential-stuffing attacks.
 * In development/production: allows up to 15 login/register attempts per 15-minute window per IP.
 * In automated test suite: skips unless explicitly tested via 'x-test-rate-limit' header.
 */
const isTestMode = () => {
  return (
    process.env.NODE_ENV === 'test' ||
    process.execArgv.includes('--test') ||
    process.argv.some((a) => typeof a === 'string' && a.includes('test'))
  );
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: (req) => (req.headers['x-test-rate-limit'] === 'true' ? 3 : 15),
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
  skip: (req) => {
    // In automated tests, skip normal requests unless explicitly testing rate limiting
    return isTestMode() && req.headers['x-test-rate-limit'] !== 'true';
  },
});

/**
 * General API rate limiter for standard endpoints.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  skip: () => isTestMode(),
});
