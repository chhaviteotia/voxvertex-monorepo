/**
 * Database-Agnostic ID Utilities
 * 
 * This utility abstracts ID operations to make migration from MongoDB to SQL/AWS easier.
 * Currently uses MongoDB ObjectId, but can be swapped out for UUID, SQL INT/BIGINT, etc.
 * 
 * Migration Strategy:
 * - For SQL: Replace with UUID or auto-incrementing integers
 * - For AWS DynamoDB: Use string IDs or UUID
 * - For other NoSQL: Use appropriate ID format
 * 
 * Usage:
 *   import { isValidId, createId, normalizeId } from '../utils/db/idUtils';
 */

import mongoose from 'mongoose';

/**
 * Database ID Provider Interface
 * This can be swapped out when migrating to a different database
 */
class MongoDBIdProvider {
  /**
   * Check if an ID is valid
   * @param {string|Object} id - ID to validate
   * @returns {boolean} True if valid
   */
  isValid(id) {
    if (!id) return false;
    // Support both mongoose 5.x and 6.x+ APIs
    if (mongoose.isValidObjectId) {
      return mongoose.isValidObjectId(id);
    }
    return mongoose.Types?.ObjectId?.isValid(id) || false;
  }

  /**
   * Create a new ID
   * @returns {Object} New ID object
   */
  create() {
    return new mongoose.Types.ObjectId();
  }

  /**
   * Convert a string/ID to the database ID format
   * @param {string|Object} id - ID to normalize
   * @returns {Object|null} Normalized ID or null if invalid
   */
  normalize(id) {
    if (!id) return null;
    // If already an ObjectId, return as is
    if (id instanceof mongoose.Types.ObjectId) {
      return id;
    }
    if (this.isValid(id)) {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (err) {
        console.error('Error normalizing ID:', id, err);
        return null;
      }
    }
    return null;
  }

  /**
   * Convert ID to string
   * @param {string|Object} id - ID to convert
   * @returns {string} String representation of ID
   */
  toString(id) {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (id.toString) return id.toString();
    return String(id);
  }

  /**
   * Compare two IDs for equality
   * @param {string|Object} id1 - First ID
   * @param {string|Object} id2 - Second ID
   * @returns {boolean} True if equal
   */
  equals(id1, id2) {
    if (!id1 || !id2) return false;
    const str1 = this.toString(id1);
    const str2 = this.toString(id2);
    return str1 === str2;
  }
}

// Future: SQL ID Provider (for migration)
class SQLIdProvider {
  isValid(id) {
    if (!id) return false;
    // For SQL, could be UUID or integer
    if (typeof id === 'number') return Number.isInteger(id) && id > 0;
    if (typeof id === 'string') {
      // UUID format or numeric string
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id) || /^\d+$/.test(id);
    }
    return false;
  }

  create() {
    // For SQL, this would generate UUID or use auto-increment
    // Using crypto for UUID v4
    const crypto = require('crypto');
    return crypto.randomUUID();
  }

  normalize(id) {
    if (!id) return null;
    if (this.isValid(id)) {
      return typeof id === 'string' ? id : String(id);
    }
    return null;
  }

  toString(id) {
    if (!id) return null;
    return String(id);
  }

  equals(id1, id2) {
    if (!id1 || !id2) return false;
    return this.toString(id1) === this.toString(id2);
  }
}

// Select ID provider based on environment or config
// For now, use MongoDB. When migrating, change this to SQLIdProvider
const getProvider = () => {
  const dbType = process.env.DB_TYPE || 'mongodb';
  
  switch (dbType.toLowerCase()) {
    case 'sql':
    case 'postgresql':
    case 'mysql':
      return new SQLIdProvider();
    case 'mongodb':
    default:
      return new MongoDBIdProvider();
  }
};

const idProvider = getProvider();

/**
 * Check if an ID is valid
 * @param {string|Object} id - ID to validate
 * @returns {boolean} True if valid
 */
export const isValidId = (id) => {
  return idProvider.isValid(id);
};

/**
 * Create a new ID
 * @returns {Object|string} New ID (ObjectId for MongoDB, string for SQL)
 */
export const createId = () => {
  return idProvider.create();
};

/**
 * Normalize an ID to the database format
 * @param {string|Object} id - ID to normalize
 * @returns {Object|string|null} Normalized ID or null if invalid
 */
export const normalizeId = (id) => {
  return idProvider.normalize(id);
};

/**
 * Convert ID to string
 * @param {string|Object} id - ID to convert
 * @returns {string|null} String representation or null
 */
export const idToString = (id) => {
  return idProvider.toString(id);
};

/**
 * Compare two IDs for equality
 * @param {string|Object} id1 - First ID
 * @param {string|Object} id2 - Second ID
 * @returns {boolean} True if equal
 */
export const idsEqual = (id1, id2) => {
  return idProvider.equals(id1, id2);
};

/**
 * Convert array of IDs to normalized format
 * @param {Array<string|Object>} ids - Array of IDs
 * @returns {Array<Object|string>} Array of normalized IDs
 */
export const normalizeIds = (ids) => {
  if (!Array.isArray(ids)) return [];
  return ids.map(id => normalizeId(id)).filter(id => id !== null);
};

// Default export for convenience
export default {
  isValidId,
  createId,
  normalizeId,
  idToString,
  idsEqual,
  normalizeIds
};

