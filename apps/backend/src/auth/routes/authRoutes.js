import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getCurrentUser, 
  logoutUser, 
  checkAuthStatus, 
  refreshToken 
} from '../controllers/authController.js';
import {
  sendOtp,
  verifyOtp,
  resendOtp
} from '../controllers/otpController.js';
import { authenticateJWT } from '../../middleware/jwtAuth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with JWT
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateJWT, getCurrentUser);

/**
 * @route   GET /api/auth/status
 * @desc    Check authentication status
 * @access  Private
 */
router.get('/status', authenticateJWT, checkAuthStatus);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public (uses refresh token from cookie)
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticateJWT, logoutUser);

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to user's email for verification
 * @access  Public
 */
router.post('/send-otp', sendOtp);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP submitted by user
 * @access  Public
 */
router.post('/verify-otp', verifyOtp);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user's email
 * @access  Public
 */
router.post('/resend-otp', resendOtp);

export default router;

