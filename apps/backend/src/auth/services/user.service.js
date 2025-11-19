import EnhancedUser from '../models/enhancedUser.js';
import bcrypt from 'bcryptjs';

/**
 * User Service - Handles all user-related database operations
 * Database-agnostic structure - can be migrated to SQL/AWS easily
 */
class UserService {
  
  /**
   * Create a new user with basic information
   * @param {Object} userData - User data object
   * @returns {Promise<Object>} - Created user object (without password)
   */
  async createUser(userData) {
    try {
      const { firstName, lastName, email, mobileNo, password, role, roleSpecificData } = userData;
      
      // Check if user already exists
      const existingUserQuery = { email };
      if (mobileNo) {
        existingUserQuery.$or = [{ email }, { mobileNo }];
      }
      
      const existingUser = await EnhancedUser.findOne(existingUserQuery);
      
      if (existingUser) {
        throw new Error('User already exists with this email or phone number');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create user
      const user = new EnhancedUser({
        firstName,
        lastName,
        email,
        mobileNo,
        password: hashedPassword,
        role: role || 'participant',
        roleSpecificData: roleSpecificData || {},
        isEmailVerified: false // Will be verified via OTP
      });
      
      await user.save();
      
      // Return sanitized user (password removed via toJSON method)
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }
  
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - User object (without password)
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      const user = await EnhancedUser.findById(userId).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
  
  /**
   * Get user by email
   * @param {String} email - User email
   * @returns {Promise<Object>} - User object (with password for verification)
   */
  async getUserByEmail(email) {
    try {
      const user = await EnhancedUser.findOne({ email: email.toLowerCase() });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }
  
  /**
   * Verify user credentials for login
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>} - User object (without password)
   */
  async verifyCredentials(email, password) {
    try {
      const user = await EnhancedUser.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check if account is active
      if (user.accountStatus !== 'active') {
        throw new Error('Account is not active');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Update last login
      await user.updateLastLogin();
      
      return this.sanitizeUser(user);
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }
  
  /**
   * Update user basic information
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user object
   */
  async updateUserBasicInfo(userId, updateData) {
    try {
      const allowedUpdates = [
        'bio', 'professionalTitle', 'location', 'areaOfExpertise',
        'roleSpecificData', 'mobileNo', 'yearsOfExperience'
      ];
      
      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
          if (key === 'areaOfExpertise') {
            filteredData[key] = Array.isArray(updateData[key]) 
              ? updateData[key] 
              : [updateData[key]].filter(Boolean);
          } else if (key === 'mobileNo') {
            filteredData[key] = updateData[key] === '' ? null : updateData[key];
          } else {
            filteredData[key] = updateData[key];
          }
        }
      });
      
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        { ...filteredData, isProfileComplete: true },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      user.checkProfileCompleteness();
      await user.save();
      
      return user;
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
  
  /**
   * Update user profile image
   * @param {String} userId - User ID
   * @param {Object} imageData - Image data (URL and Cloudinary ID)
   * @returns {Promise<Object>} - Updated user object
   */
  async updateProfileImage(userId, imageData) {
    try {
      const updateData = {
        profileImageUrl: imageData.profileImageUrl,
        cloudinaryPublicId: imageData.cloudinaryPublicId
      };
      
      const user = await EnhancedUser.findByIdAndUpdate(
        userId,
        updateData,
        { new: true }
      ).select('-password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      if (!user.isProfileComplete) {
        user.isProfileComplete = true;
        await user.save();
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to update profile image: ${error.message}`);
    }
  }
  
  /**
   * Remove sensitive information from user object
   * @param {Object} user - User object
   * @returns {Object} - Sanitized user object
   */
  sanitizeUser(user) {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
  }
}

export default new UserService();

