import EnhancedProfile from '../models/enhancedProfile.js';
import EnhancedUser from '../../auth/models/enhancedUser.js';
import mongoose from 'mongoose';
import { createId } from '../../utils/db/idUtils.js';

/**
 * Profile Service - Database-agnostic service layer
 * This service abstracts database operations, making it easy to migrate from MongoDB to SQL/AWS
 * All database-specific logic is contained here, controllers only call service methods
 */
class ProfileService {
  /**
   * Get or create user profile by userId
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Profile object
   */
  static async getOrCreateProfile(userId) {
    try {
      // Try to find existing profile
      let profile = await EnhancedProfile.findOne({ user: userId })
        .populate('user', 'firstName lastName email role profileImageUrl');
      
      if (!profile) {
        // Create new profile if it doesn't exist
        profile = new EnhancedProfile({
          user: userId
        });
        await profile.save();
        
        // Update user with profile reference (if needed)
        const user = await EnhancedUser.findById(userId);
        if (user && !user.profile) {
          user.profile = profile._id;
          await user.save();
        }
      }

      return profile;
    } catch (error) {
      throw new Error(`Failed to get or create profile: ${error.message}`);
    }
  }

  /**
   * Get profile by userId
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Profile object
   */
  static async getProfile(userId, options = {}) {
    try {
      const { includeReviews = true } = options;
      let query = EnhancedProfile.findOne({ user: userId })
        .populate('user', 'firstName lastName email role profileImageUrl bio professionalTitle location areaOfExpertise');

      // Only populate reviews if requested
      if (includeReviews) {
        query = query.populate('reviews.reviewer', 'firstName lastName profileImageUrl');
        
        // Conditionally populate event only if EnhancedEvent model exists
        // This prevents errors when the model hasn't been registered yet
        try {
          // Check if model exists before populating
          if (mongoose.models && 'EnhancedEvent' in mongoose.models) {
            query = query.populate('reviews.event', 'topic eventDate');
          }
        } catch (populateError) {
          // If EnhancedEvent model doesn't exist, continue without populating event
          // This is fine - reviews will still work without event details
        }
      }

      const profile = await query;

      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    } catch (error) {
      throw new Error(`Failed to get profile: ${error.message}`);
    }
  }

  /**
   * Update profile bio
   * @param {string} userId - User ID
   * @param {string} bio - Bio text
   * @returns {Promise<Object>} Updated profile
   */
  static async updateBio(userId, bio) {
    try {
      // Update bio in user model (if stored there)
      await EnhancedUser.findByIdAndUpdate(userId, { bio });
      
      // Profile model doesn't store bio separately, it's in user model
      // Skip populating reviews for bio update to avoid EnhancedEvent dependency
      const profile = await this.getProfile(userId, { includeReviews: false });
      return profile;
    } catch (error) {
      throw new Error(`Failed to update bio: ${error.message}`);
    }
  }

  /**
   * Add work experience
   * @param {string} userId - User ID
   * @param {Object} experienceData - Experience data
   * @returns {Promise<Object>} Updated profile
   */
  static async addExperience(userId, experienceData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const newExperience = {
        _id: createId(),
        ...experienceData
      };
      
      profile.experience.push(newExperience);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add experience: ${error.message}`);
    }
  }

  /**
   * Update work experience
   * @param {string} userId - User ID
   * @param {string} experienceId - Experience ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateExperience(userId, experienceId, updateData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const experienceIndex = profile.experience.findIndex(
        exp => exp._id.toString() === experienceId
      );
      
      if (experienceIndex === -1) {
        throw new Error('Experience not found');
      }
      
      // Update the experience
      Object.assign(profile.experience[experienceIndex], updateData);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to update experience: ${error.message}`);
    }
  }

  /**
   * Remove work experience
   * @param {string} userId - User ID
   * @param {string} experienceId - Experience ID
   * @returns {Promise<Object>} Updated profile
   */
  static async removeExperience(userId, experienceId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      profile.experience = profile.experience.filter(
        exp => exp._id.toString() !== experienceId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove experience: ${error.message}`);
    }
  }

  /**
   * Add education
   * @param {string} userId - User ID
   * @param {Object} educationData - Education data
   * @returns {Promise<Object>} Updated profile
   */
  static async addEducation(userId, educationData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const newEducation = {
        _id: createId(),
        ...educationData
      };
      
      profile.education.push(newEducation);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add education: ${error.message}`);
    }
  }

  /**
   * Update education
   * @param {string} userId - User ID
   * @param {string} educationId - Education ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateEducation(userId, educationId, updateData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const educationIndex = profile.education.findIndex(
        edu => edu._id.toString() === educationId
      );
      
      if (educationIndex === -1) {
        throw new Error('Education not found');
      }
      
      Object.assign(profile.education[educationIndex], updateData);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to update education: ${error.message}`);
    }
  }

  /**
   * Remove education
   * @param {string} userId - User ID
   * @param {string} educationId - Education ID
   * @returns {Promise<Object>} Updated profile
   */
  static async removeEducation(userId, educationId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      profile.education = profile.education.filter(
        edu => edu._id.toString() !== educationId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove education: ${error.message}`);
    }
  }

  /**
   * Add award/certification
   * @param {string} userId - User ID
   * @param {Object} awardData - Award data
   * @returns {Promise<Object>} Updated profile
   */
  static async addAward(userId, awardData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const newAward = {
        _id: createId(),
        ...awardData
      };
      
      profile.awards.push(newAward);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add award: ${error.message}`);
    }
  }

  /**
   * Update award
   * @param {string} userId - User ID
   * @param {string} awardId - Award ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateAward(userId, awardId, updateData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const awardIndex = profile.awards.findIndex(
        award => award._id.toString() === awardId
      );
      
      if (awardIndex === -1) {
        throw new Error('Award not found');
      }
      
      Object.assign(profile.awards[awardIndex], updateData);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to update award: ${error.message}`);
    }
  }

  /**
   * Remove award
   * @param {string} userId - User ID
   * @param {string} awardId - Award ID
   * @returns {Promise<Object>} Updated profile
   */
  static async removeAward(userId, awardId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      profile.awards = profile.awards.filter(
        award => award._id.toString() !== awardId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove award: ${error.message}`);
    }
  }

  /**
   * Add featured video
   * @param {string} userId - User ID
   * @param {Object} videoData - Video data
   * @returns {Promise<Object>} Updated profile
   */
  static async addVideo(userId, videoData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const newVideo = {
        _id: createId(),
        ...videoData
      };
      
      profile.featuredVideos.push(newVideo);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to add video: ${error.message}`);
    }
  }

  /**
   * Update featured video
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated profile
   */
  static async updateVideo(userId, videoId, updateData) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      const videoIndex = profile.featuredVideos.findIndex(
        video => video._id.toString() === videoId
      );
      
      if (videoIndex === -1) {
        throw new Error('Video not found');
      }
      
      Object.assign(profile.featuredVideos[videoIndex], updateData);
      await profile.save();
      
      return profile;
    } catch (error) {
      throw new Error(`Failed to update video: ${error.message}`);
    }
  }

  /**
   * Remove featured video
   * @param {string} userId - User ID
   * @param {string} videoId - Video ID
   * @returns {Promise<Object>} Updated profile
   */
  static async removeVideo(userId, videoId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      profile.featuredVideos = profile.featuredVideos.filter(
        video => video._id.toString() !== videoId
      );
      
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to remove video: ${error.message}`);
    }
  }

  /**
   * Update skills
   * @param {string} userId - User ID
   * @param {Array} skills - Skills array
   * @returns {Promise<Object>} Updated profile
   */
  static async updateSkills(userId, skills) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      profile.skills = skills;
      await profile.save();
      return profile;
    } catch (error) {
      throw new Error(`Failed to update skills: ${error.message}`);
    }
  }

  /**
   * Get profile statistics
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Profile statistics
   */
  static async getProfileStats(userId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      
      return {
        totalExperience: profile.experience.length,
        totalEducation: profile.education.length,
        totalAwards: profile.awards.length,
        totalVideos: profile.featuredVideos.length,
        totalReviews: profile.reviews.length,
        averageRating: profile.ratings.overall.average,
        profileViews: profile.stats.profileViews,
        totalBookings: profile.stats.totalBookings
      };
    } catch (error) {
      throw new Error(`Failed to get profile stats: ${error.message}`);
    }
  }

  /**
   * Increment profile views
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async incrementProfileViews(userId) {
    try {
      const profile = await this.getOrCreateProfile(userId);
      profile.stats.profileViews += 1;
      await profile.save();
    } catch (error) {
      // Don't throw error for view tracking
      console.error(`Failed to increment profile views: ${error.message}`);
    }
  }
}

export default ProfileService;

