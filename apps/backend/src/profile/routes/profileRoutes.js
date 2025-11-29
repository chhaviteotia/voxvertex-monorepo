import express from 'express';
import {
  getProfile,
  updateBio,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  addAward,
  updateAward,
  removeAward,
  addVideo,
  updateVideo,
  removeVideo,
  updateSkills,
  addReview,
  getReviews,
  updatePrivacySettings,
  uploadImage,
  deleteImage,
  incrementProfileViews,
  searchProfiles,
  getProfileStats,
  uploadProfileImage
} from '../controllers/profileController.js';
import { authenticateJWT } from '../../middleware/jwtAuth.js';

const router = express.Router();

// All profile routes require authentication
router.use(authenticateJWT);

/**
 * @route   GET /api/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/', getProfile);

/**
 * @route   GET /api/profile/me
 * @desc    Get user profile (alias for consistency)
 * @access  Private
 */
router.get('/me', getProfile);

/**
 * @route   PUT /api/profile/bio
 * @desc    Update profile bio
 * @access  Private
 */
router.put('/bio', updateBio);

/**
 * @route   GET /api/profile/stats
 * @desc    Get profile statistics
 * @access  Private
 */
router.get('/stats', getProfileStats);

/**
 * @route   GET /api/profile/search
 * @desc    Search profiles
 * @access  Private
 */
router.get('/search', searchProfiles);

// Experience routes
router.post('/experience', addExperience);
router.put('/experience/:experienceId', updateExperience);
router.delete('/experience/:experienceId', removeExperience);

// Education routes
router.post('/education', addEducation);
router.put('/education/:educationId', updateEducation);
router.delete('/education/:educationId', removeEducation);

// Award routes
router.post('/awards', addAward);
router.put('/awards/:awardId', updateAward);
router.delete('/awards/:awardId', removeAward);

// Video routes
router.post('/videos', addVideo);
router.put('/videos/:videoId', updateVideo);
router.delete('/videos/:videoId', removeVideo);

// Skills route
router.put('/skills', updateSkills);

// Reviews routes
router.post('/reviews', addReview);
router.get('/reviews', getReviews);

// Privacy settings route
router.put('/privacy', updatePrivacySettings);

// Profile image routes
router.put('/image', uploadProfileImage, uploadImage);
router.delete('/image', deleteImage);

// Profile views route
router.post('/increment-views', incrementProfileViews);

export default router;
