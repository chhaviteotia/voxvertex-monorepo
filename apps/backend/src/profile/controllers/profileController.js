import ProfileService from '../services/profile.service.js';
import multer from 'multer';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for memory storage (for Cloudinary upload)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

export const uploadProfileImage = upload.single('image');

/**
 * Profile Controller - Database-agnostic controller
 * All database operations are delegated to ProfileService
 * This makes it easy to switch databases without changing controller code
 */

/**
 * Get user profile
 * @route GET /api/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    const profile = await ProfileService.getProfile(userId);
    
    // Convert to plain object
    const profileData = profile.toObject ? profile.toObject() : profile;
    
    res.status(200).json({
      success: true,
      data: profileData // Standardized to 'data' for consistency
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(error.message === 'Profile not found' ? 404 : 500).json({
      success: false,
      message: error.message || 'Error fetching profile'
    });
  }
};

/**
 * Update profile bio
 * @route PUT /api/profile/bio
 */
export const updateBio = async (req, res) => {
  try {
    const { bio } = req.body;
    const userId = req.user._id || req.user.id;

    if (typeof bio === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Bio is required'
      });
    }

    const profile = await ProfileService.updateBio(userId, bio);

    res.status(200).json({
      success: true,
      message: 'Bio updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update bio error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating bio'
    });
  }
};

/**
 * Add work experience
 * @route POST /api/profile/experience
 */
export const addExperience = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const experienceData = req.body;

    const profile = await ProfileService.addExperience(userId, experienceData);

    res.status(201).json({
      success: true,
      message: 'Experience added successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding experience'
    });
  }
};

/**
 * Update work experience
 * @route PUT /api/profile/experience/:experienceId
 */
export const updateExperience = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { experienceId } = req.params;
    const updateData = req.body;

    const profile = await ProfileService.updateExperience(userId, experienceId, updateData);

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update experience error:', error);
    const statusCode = error.message === 'Experience not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating experience'
    });
  }
};

/**
 * Remove work experience
 * @route DELETE /api/profile/experience/:experienceId
 */
export const removeExperience = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { experienceId } = req.params;

    const profile = await ProfileService.removeExperience(userId, experienceId);

    res.status(200).json({
      success: true,
      message: 'Experience removed successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Remove experience error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing experience'
    });
  }
};

/**
 * Add education
 * @route POST /api/profile/education
 */
export const addEducation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const educationData = req.body;

    const profile = await ProfileService.addEducation(userId, educationData);

    res.status(201).json({
      success: true,
      message: 'Education added successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding education'
    });
  }
};

/**
 * Update education
 * @route PUT /api/profile/education/:educationId
 */
export const updateEducation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { educationId } = req.params;
    const updateData = req.body;

    const profile = await ProfileService.updateEducation(userId, educationId, updateData);

    res.status(200).json({
      success: true,
      message: 'Education updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update education error:', error);
    const statusCode = error.message === 'Education not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating education'
    });
  }
};

/**
 * Remove education
 * @route DELETE /api/profile/education/:educationId
 */
export const removeEducation = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { educationId } = req.params;

    const profile = await ProfileService.removeEducation(userId, educationId);

    res.status(200).json({
      success: true,
      message: 'Education removed successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Remove education error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing education'
    });
  }
};

/**
 * Add award/certification
 * @route POST /api/profile/awards
 */
export const addAward = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const awardData = req.body;

    const profile = await ProfileService.addAward(userId, awardData);

    res.status(201).json({
      success: true,
      message: 'Award added successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Add award error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding award'
    });
  }
};

/**
 * Update award
 * @route PUT /api/profile/awards/:awardId
 */
export const updateAward = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { awardId } = req.params;
    const updateData = req.body;

    const profile = await ProfileService.updateAward(userId, awardId, updateData);

    res.status(200).json({
      success: true,
      message: 'Award updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update award error:', error);
    const statusCode = error.message === 'Award not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating award'
    });
  }
};

/**
 * Remove award
 * @route DELETE /api/profile/awards/:awardId
 */
export const removeAward = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { awardId } = req.params;

    const profile = await ProfileService.removeAward(userId, awardId);

    res.status(200).json({
      success: true,
      message: 'Award removed successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Remove award error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing award'
    });
  }
};

/**
 * Add featured video
 * @route POST /api/profile/videos
 */
export const addVideo = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const videoData = req.body;

    const profile = await ProfileService.addVideo(userId, videoData);

    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Add video error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding video'
    });
  }
};

/**
 * Update featured video
 * @route PUT /api/profile/videos/:videoId
 */
export const updateVideo = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { videoId } = req.params;
    const updateData = req.body;

    const profile = await ProfileService.updateVideo(userId, videoId, updateData);

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update video error:', error);
    const statusCode = error.message === 'Video not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error updating video'
    });
  }
};

/**
 * Remove featured video
 * @route DELETE /api/profile/videos/:videoId
 */
export const removeVideo = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { videoId } = req.params;

    const profile = await ProfileService.removeVideo(userId, videoId);

    res.status(200).json({
      success: true,
      message: 'Video removed successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Remove video error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error removing video'
    });
  }
};

/**
 * Update skills
 * @route PUT /api/profile/skills
 */
export const updateSkills = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { skills } = req.body;

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
    }

    const profile = await ProfileService.updateSkills(userId, skills);

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating skills'
    });
  }
};

/**
 * Add review
 * @route POST /api/profile/reviews
 */
export const addReview = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { targetUserId, rating, remarks, eventId, reviewType } = req.body;

    if (!targetUserId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Target user ID and rating are required'
      });
    }

    const profile = await ProfileService.addReview(targetUserId, {
      reviewer: userId,
      reviewerName: `${req.user.firstName} ${req.user.lastName}`,
      rating,
      remarks,
      event: eventId,
      reviewType: reviewType || 'general'
    });

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error adding review'
    });
  }
};

/**
 * Get reviews
 * @route GET /api/profile/reviews
 */
export const getReviews = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.getProfile(userId);

    res.status(200).json({
      success: true,
      data: {
        reviews: profile.reviews || [],
        ratings: profile.ratings || {}
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching reviews'
    });
  }
};

/**
 * Update privacy settings
 * @route PUT /api/profile/privacy
 */
export const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { privacySettings } = req.body;

    const profile = await ProfileService.updatePrivacySettings(userId, privacySettings);

    res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating privacy settings'
    });
  }
};

/**
 * Upload profile image
 * @route PUT /api/profile/image
 * Uses Cloudinary for image storage (matches old project implementation)
 */
export const uploadImage = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const EnhancedUser = (await import('../../auth/models/enhancedUser.js')).default;
    
    // Get existing user to check for old Cloudinary image to delete
    const existingUser = await EnhancedUser.findById(userId).select('cloudinaryPublicId profileImageUrl');
    let oldPublicId = existingUser?.cloudinaryPublicId;

    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET;

    let profileImageUrl = null;
    let cloudinaryPublicId = null;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const stream = Readable.from(req.file.buffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profiles',
            resource_type: 'image',
            public_id: `profile_${userId}_${Date.now()}`,
            transformation: [
              { width: 500, height: 500, crop: 'fill', gravity: 'face' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        
        stream.pipe(uploadStream);
      });
      
      profileImageUrl = uploadResult.secure_url;
      cloudinaryPublicId = uploadResult.public_id;
      
      console.log(`✅ Profile image uploaded to Cloudinary:`, {
        url: profileImageUrl,
        public_id: cloudinaryPublicId
      });

      // Delete old image from Cloudinary if it exists
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId);
          console.log(`✅ Deleted old profile image from Cloudinary: ${oldPublicId}`);
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete old Cloudinary image:', deleteError.message);
          // Don't fail the request if deletion fails
        }
      }
    } else {
      // Fallback: Store as base64 (not recommended for production)
      console.warn('⚠️ Cloudinary not configured. Storing profile image as base64.');
      const base64Data = req.file.buffer.toString('base64');
      profileImageUrl = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    // Update user profile image
    const user = await EnhancedUser.findByIdAndUpdate(
      userId,
      {
        profileImageUrl: profileImageUrl,
        cloudinaryPublicId: cloudinaryPublicId || undefined
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: {
        user: user.toObject ? user.toObject() : user
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error uploading image'
    });
  }
};

/**
 * Delete profile image
 * @route DELETE /api/profile/image
 * Also deletes from Cloudinary if cloudinaryPublicId exists
 */
export const deleteImage = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const EnhancedUser = (await import('../../auth/models/enhancedUser.js')).default;
    
    // Get user to check for Cloudinary public ID
    const existingUser = await EnhancedUser.findById(userId).select('cloudinaryPublicId');
    
    // Delete from Cloudinary if public ID exists
    if (existingUser?.cloudinaryPublicId) {
      const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                      process.env.CLOUDINARY_API_KEY && 
                                      process.env.CLOUDINARY_API_SECRET;
      
      if (isCloudinaryConfigured) {
        try {
          await cloudinary.uploader.destroy(existingUser.cloudinaryPublicId);
          console.log(`✅ Deleted profile image from Cloudinary: ${existingUser.cloudinaryPublicId}`);
        } catch (deleteError) {
          console.warn('⚠️ Failed to delete Cloudinary image:', deleteError.message);
          // Continue with deletion even if Cloudinary deletion fails
        }
      }
    }

    // Remove from database
    const user = await EnhancedUser.findByIdAndUpdate(
      userId,
      {
        $unset: { 
          profileImageUrl: '', 
          cloudinaryPublicId: '' 
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully',
      data: {
        user: user.toObject ? user.toObject() : user
      }
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting image'
    });
  }
};

/**
 * Increment profile views
 * @route POST /api/profile/increment-views
 */
export const incrementProfileViews = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const profile = await ProfileService.incrementProfileViews(userId);

    res.status(200).json({
      success: true,
      message: 'Profile views incremented',
      data: profile.toObject ? profile.toObject() : profile
    });
  } catch (error) {
    console.error('Increment profile views error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error incrementing profile views'
    });
  }
};

/**
 * Search profiles
 * @route GET /api/profile/search
 */
export const searchProfiles = async (req, res) => {
  try {
    const { query, ...filters } = req.query;
    const profiles = await ProfileService.searchProfiles(query, filters);

    res.status(200).json({
      success: true,
      data: profiles.map(p => p.toObject ? p.toObject() : p)
    });
  } catch (error) {
    console.error('Search profiles error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error searching profiles'
    });
  }
};

/**
 * Get profile statistics
 * @route GET /api/profile/stats
 */
export const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const stats = await ProfileService.getProfileStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching profile stats'
    });
  }
};
