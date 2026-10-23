import mongoose from 'mongoose';

/**
 * Helper to get the current database connectivity status
 * Safely sanitizes any sensitive connection details.
 */
export const getDatabaseStatus = () => {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;
  const status = stateMap[readyState] || 'unknown';

  return {
    status,
    readyState,
    host: readyState === 1 ? mongoose.connection.host : null,
    name: readyState === 1 ? mongoose.connection.name : null,
  };
};

/**
 * Connect to MongoDB Atlas via Mongoose
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('<password>') || uri.includes('<db_password>')) {
    console.warn(
      '[Database Warning] MONGODB_URI is not configured with valid credentials in .env. Server is starting with database disconnected.'
    );
    return false;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if Atlas cluster unreachable
    });

    console.log(`[Database] MongoDB Atlas Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    // Log safe error without exposing credentials that might be in URI
    console.error(`[Database Error] Connection failed: ${error.message}`);
    return false;
  }
};

// Monitor ongoing Mongoose connection events
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB connection lost.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB connection re-established.');
});
