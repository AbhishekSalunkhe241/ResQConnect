import express from 'express';
import { getDatabaseStatus } from '../config/db.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    System health-check and database connectivity inspection
 *          Returns HTTP 200 if database is healthy; HTTP 503 if disconnected.
 * @access  Public
 */
router.get('/', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isDbConnected = dbStatus.status === 'connected';

  res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    status: isDbConnected ? 'healthy' : 'degraded',
    message: isDbConnected
      ? 'ResQConnect Backend service operational with active database connection.'
      : 'ResQConnect Backend service operational; database is disconnected (configure MONGODB_URI).',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.status,
      connected: isDbConnected,
      clusterHost: dbStatus.host || null,
      databaseName: dbStatus.name || null,
    },
  });
});

/**
 * @route   GET /api/health/live
 * @desc    Liveness probe: returns 200 if HTTP process is up and responding
 * @access  Public
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'alive',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/health/ready
 * @desc    Readiness probe: returns 200 only when database is ready to accept traffic
 * @access  Public
 */
router.get('/ready', (req, res) => {
  const dbStatus = getDatabaseStatus();
  const isDbConnected = dbStatus.status === 'connected';

  res.status(isDbConnected ? 200 : 503).json({
    success: isDbConnected,
    ready: isDbConnected,
    status: isDbConnected ? 'ready' : 'not_ready',
    databaseStatus: dbStatus.status,
  });
});

export default router;
