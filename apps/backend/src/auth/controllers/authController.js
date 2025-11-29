import UserService from '../services/user.service.js';
import { generateTokenPair, verifyRefreshToken } from '../../utils/tokens/jwt.utils.js';
import { setAllAuthCookies, clearAuthCookies } from '../../utils/cookies/cookie.utils.js';
import bcrypt from "bcryptjs";

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 * Database-agnostic structure - can be migrated to SQL/AWS easily
 */

// Password validation function
const isPasswordValid = (password) => {
  return password.length >= 6 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, role, industry, activities } = req.body;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }
    
    // Validate password
    if (!isPasswordValid(password)) {
      return res.status(400).json({ 
        success: false,
        message: "Password must be at least 6 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character" 
      });
    }
    
    // Validate role
    const validRoles = ['participant', 'speaker', 'organizer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }
    
    // Prepare role-specific data
    const roleSpecificData = {};
    if (role === 'speaker') {
      roleSpecificData.workEmail = email; // Can be updated later
    }
    if (industry) {
      roleSpecificData.industry = industry;
    }
    if (activities && Array.isArray(activities)) {
      roleSpecificData.activities = activities;
    }
    
    // Create user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobileNo: phone || null,
      password,
      role: role || 'participant',
      roleSpecificData
    };
    
    const user = await UserService.createUser(userData);
    
    // Generate JWT tokens
    const tokens = generateTokenPair(user);
    
    // Set secure cookies including user role
    setAllAuthCookies(res, tokens, user);
    
    // Determine redirect URL based on user role - Updated to new profile routes
    let redirectUrl = '/dashboard';
    switch (user.role) {
      case 'speaker':
        redirectUrl = '/profile/speaker';
        break;
      case 'organizer':
        redirectUrl = '/profile/organizer';
        break;
      case 'participant':
        redirectUrl = '/profile/participant';
        break;
      default:
        redirectUrl = '/dashboard';
    }
    
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token to client (it's in httpOnly cookie)
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await UserService.verifyCredentials(email.toLowerCase(), password);
    
    // Generate JWT tokens
    const tokens = generateTokenPair(user);
    
    // Set secure cookies including user role
    setAllAuthCookies(res, tokens, user);
    
    // Determine redirect URL based on user role - Updated to new profile routes
    let redirectUrl = '/dashboard';
    switch (user.role) {
      case 'speaker':
        redirectUrl = '/profile/speaker';
        break;
      case 'organizer':
        redirectUrl = '/profile/organizer';
        break;
      case 'participant':
        redirectUrl = '/profile/participant';
        break;
      default:
        redirectUrl = '/dashboard';
    }
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user,
      redirectUrl,
      tokens: {
        accessToken: tokens.accessToken,
        // Don't send refresh token to client (it's in httpOnly cookie)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    });
  }
};

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    const user = await UserService.getUserById(req.user._id || req.user.id);
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user'
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logoutUser = async (req, res) => {
  try {
    // Clear authentication cookies
    clearAuthCookies(res);
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Logout failed'
    });
  }
};

/**
 * Check authentication status
 * @route GET /api/auth/status
 */
export const checkAuthStatus = async (req, res) => {
  try {
    if (req.user) {
      const user = await UserService.getUserById(req.user._id || req.user.id);
      
      return res.status(200).json({
        success: true,
        isAuthenticated: true,
        user
      });
    } else {
      return res.status(200).json({
        success: true,
        isAuthenticated: false,
        message: 'Not authenticated'
      });
    }
  } catch (error) {
    console.error('Check auth status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to check auth status'
    });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 */
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided',
        code: 'NO_REFRESH_TOKEN'
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    const user = await UserService.getUserById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generate new token pair
    const tokens = generateTokenPair(user);
    
    // Set new cookies including user role
    setAllAuthCookies(res, tokens, user);
    
    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      tokens: {
        accessToken: tokens.accessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    clearAuthCookies(res);
    
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_REFRESH_TOKEN'
    });
  }
};

