import Redis from 'ioredis';

let redis = null;
let redisAvailable = false;

// Check if Redis should be used (can be disabled via env)
const USE_REDIS = process.env.USE_REDIS !== 'false';

if (USE_REDIS) {
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      // Optional: Enable TLS if Redis server requires it (for AWS ElastiCache)
      tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Enable offline queue for better error handling
      enableOfflineQueue: false,
      // Lazy connect - don't connect immediately
      lazyConnect: true,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
      redisAvailable = true;
    });

    redis.on('ready', () => {
      redisAvailable = true;
    });

    redis.on('error', (err) => {
      console.warn('⚠️ Redis connection error:', err.message);
      redisAvailable = false;
      // Don't throw error - fallback to MongoDB
    });

    redis.on('close', () => {
      redisAvailable = false;
      console.warn('⚠️ Redis connection closed - falling back to MongoDB');
    });

    // Try to connect
    redis.connect().catch(() => {
      redisAvailable = false;
      console.warn('⚠️ Redis not available - will use MongoDB fallback');
    });
  } catch (error) {
    console.warn('⚠️ Redis initialization failed - will use MongoDB fallback:', error.message);
    redisAvailable = false;
  }
} else {
  console.log('ℹ️ Redis disabled via USE_REDIS=false - using MongoDB');
  redisAvailable = false;
}

// Export redis instance and availability flag
export { redisAvailable };
export default redis;

