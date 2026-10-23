import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Initialize Database Connection
const isConnected = await connectDB();
if (!isConnected) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] MongoDB Atlas connection failed in production. Refusing to start server without database.');
    process.exit(1);
  } else {
    console.warn('[WARNING] Starting in degraded development mode without active database connection.');
  }
}

// Start HTTP Server
const HOST = '0.0.0.0';
const server = app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` ResQConnect Backend running on http://${HOST}:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Database:    ${isConnected ? 'Connected' : 'DISCONNECTED (Degraded)'}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err.message);
  // Keep server running in development or exit safely
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err.message);
});

// Graceful shutdown on process termination signals
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Gracefully closing HTTP server and database connections...`);
  const forceExitTimeout = setTimeout(() => {
    console.warn('[Server] Forcefully terminating process due to shutdown timeout.');
    process.exit(1);
  }, 5000);
  forceExitTimeout.unref();

  server.close(async () => {
    try {
      await mongoose.connection.close(false);
      console.log('[Server] Mongoose connection closed.');
    } catch (err) {
      console.error('[Server Error] Error closing Mongoose connection:', err.message);
    }
    process.exit(0);
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default server;
