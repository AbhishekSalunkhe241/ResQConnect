import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import hubRoutes from './routes/hubRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin REST clients and React Vite dev server
    crossOriginEmbedderPolicy: false,
  })
);

// Parse configured origins (strip trailing slashes, support comma-separated list)
const parseAllowedOrigins = () => {
  const envOrigins = process.env.CLIENT_ORIGIN;
  const defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://final-resqconnect-project.vercel.app',
    'https://final-resqconnect-project-main.vercel.app',
  ];
  if (!envOrigins) return defaultOrigins;
  const parsed = envOrigins
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return Array.from(new Set([...defaultOrigins, ...parsed]));
};

const allowedOrigins = parseAllowedOrigins();

// CORS configuration supporting credentials (HttpOnly cookies & Authorization Bearer)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      try {
        const isAllowed =
          allowedOrigins.includes(cleanOrigin) ||
          allowedOrigins.includes('*') ||
          /\.vercel\.app$/.test(new URL(origin).hostname) ||
          cleanOrigin === 'http://localhost:5173' ||
          cleanOrigin === 'http://127.0.0.1:5173';

        if (isAllowed) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy blocked access from origin ${origin}`));
        }
      } catch {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-XSRF-TOKEN', 'x-xsrf-token', 'X-CSRF-TOKEN'],
  })
);

// Request body parsers with bounded payload sizes
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Signed cookie parsing for HttpOnly JWT session tokens
app.use(cookieParser(process.env.COOKIE_SECRET || 'resqconnect_secure_cookie_secret_fallback'));

// Request logging (excludes sensitive authorization tokens or request bodies)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root service status endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'ResQConnect Backend API',
    status: 'online',
    health: '/api/health',
  });
});

// Rate limiting on API routes
app.use('/api', apiLimiter);

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/hubs', hubRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 for unknown endpoints
app.use(notFound);

// Centralized error handling
app.use(errorHandler);

export default app;
