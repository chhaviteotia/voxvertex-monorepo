import redis, { redisAvailable } from '../../configs/redis.config.js';
import EmailOtp from '../../auth/models/emailOtp.js';

/**
 * Set cache value - Uses Redis if available, falls back to MongoDB
 */
export const setCache = async (key, value, ttlInSeconds) => {
  // Try Redis first if available
  if (redisAvailable && redis) {
    try {
      const stringValue = JSON.stringify(value);
      
      if (ttlInSeconds) {
        await redis.set(key, stringValue, 'EX', ttlInSeconds);
        return;
      } else {
        await redis.set(key, stringValue);
        return;
      }
    } catch (error) {
      console.warn(`Redis set failed for "${key}", falling back to MongoDB:`, error.message);
      // Fall through to MongoDB fallback
    }
  }

  // MongoDB fallback
  try {
    // Extract email from key (format: "email_otp:email@example.com")
    const email = key.replace('email_otp:', '');
    
    // Delete any existing OTP for this email
    await EmailOtp.deleteMany({ email });
    
    // Create new OTP record
    const expiresAt = new Date(Date.now() + (ttlInSeconds * 1000));
    await EmailOtp.create({
      email,
      otp: value.otp,
      expiresAt
    });
  } catch (error) {
    console.error(`Error setting cache in MongoDB for key "${key}":`, error);
    throw new Error(error.message);
  }
};

/**
 * Get cache value - Uses Redis if available, falls back to MongoDB
 */
export const getCache = async (key) => {
  // Try Redis first if available
  if (redisAvailable && redis) {
    try {
      const data = await redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.warn(`Redis get failed for "${key}", falling back to MongoDB:`, error.message);
      // Fall through to MongoDB fallback
    }
  }

  // MongoDB fallback
  try {
    // Extract email from key
    const email = key.replace('email_otp:', '');
    
    // Find the most recent unverified OTP
    const otpRecord = await EmailOtp.findOne({
      email,
      isVerified: false
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return null;
    }

    // Check if expired
    if (otpRecord.expiresAt < new Date()) {
      await EmailOtp.deleteOne({ _id: otpRecord._id });
      return null;
    }

    return {
      otp: otpRecord.otp,
      createdAt: otpRecord.createdAt.getTime()
    };
  } catch (error) {
    console.error(`Error getting cache from MongoDB for key "${key}":`, error);
    return null;
  }
};

/**
 * Delete cache value - Uses Redis if available, falls back to MongoDB
 */
export const deleteCache = async (key) => {
  // Try Redis first if available
  if (redisAvailable && redis) {
    try {
      const deletedCount = await redis.del(key);
      return deletedCount === 1;
    } catch (error) {
      console.warn(`Redis delete failed for "${key}", falling back to MongoDB:`, error.message);
      // Fall through to MongoDB fallback
    }
  }

  // MongoDB fallback
  try {
    const email = key.replace('email_otp:', '');
    const result = await EmailOtp.deleteMany({ email });
    return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error deleting cache from MongoDB for key "${key}":`, error);
    return false;
  }
};

