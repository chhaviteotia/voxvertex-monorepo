import { verifyAccessToken, verifyRefreshToken } from '../utils/tokens/jwt.utils.js';
import { generateTokenPair } from '../utils/tokens/jwt.utils.js';
import { setAllAuthCookies } from '../utils/cookies/cookie.utils.js';
import UserService from '../auth/services/user.service.js';

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user to request object
 */
export const authenticateJWT = async (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.accessToken;

    if (!token) {
      // Try refresh token if access token is not available
      const refreshToken = req.cookies?.refreshToken;
      
      if (refreshToken) {
        try {
          const refreshDecoded = verifyRefreshToken(refreshToken);
          const user = await UserService.getUserById(refreshDecoded.id);
          
          if (!user) {
            return res.status(401).json({
              success: false,
              message: 'User not found'
            });
          }
          
          // Generate new token pair
          const newTokens = generateTokenPair(user);
          
          // Set new cookies
          setAllAuthCookies(res, newTokens, user);
          
          // Attach user info to request
          req.user = { 
            _id: user._id,
            id: user._id,
            role: user.role,
            email: user.email
          };
          
          req.tokenRefreshed = true;
          return next();
        } catch (refreshError) {
          return res.status(401).json({
            success: false,
            message: 'Session expired. Please login again.',
            error: 'SESSION_EXPIRED'
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Authentication required - No token provided'
      });
    }

    try {
      // Verify access token
      const decoded = verifyAccessToken(token);
      
      // Attach user info to request
      req.user = { 
        _id: decoded.id,
        id: decoded.id,
        role: decoded.role,
        email: decoded.email
      };
      
      next();
    } catch (tokenError) {
      // Access token expired, try refresh token
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Session expired. Please login again.',
          error: 'SESSION_EXPIRED'
        });
      }
      
      try {
        const refreshDecoded = verifyRefreshToken(refreshToken);
        const user = await UserService.getUserById(refreshDecoded.id);
        
        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
        
        // Generate new token pair
        const newTokens = generateTokenPair(user);
        
        // Set new cookies
        setAllAuthCookies(res, newTokens, user);
        
        // Attach user info to request
        req.user = { 
          _id: user._id,
          id: user._id,
          role: user.role,
          email: user.email
        };
        
        req.tokenRefreshed = true;
        next();
      } catch (refreshError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid session. Please login again.',
          error: 'INVALID_SESSION'
        });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication system error'
    });
  }
};

/**
 * Role-based authorization middleware
 * Checks if user has one of the required roles
 * @param {...String} roles - Required roles (organizer, speaker, participant, admin)
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role;
    if (!userRole || typeof userRole !== 'string') {
      return res.status(401).json({
        success: false,
        message: 'Invalid user role'
      });
    }
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedRoles = roles.map(role => typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase());
    
    // Normalize role names (organizer vs organiszer)
    const roleMap = {
      'organiser': 'organizer',
      'organizer': 'organizer',
      'speaker': 'speaker',
      'participant': 'participant',
      'admin': 'admin'
    };

    const finalUserRole = roleMap[normalizedUserRole] || normalizedUserRole;

    if (!normalizedRoles.includes(finalUserRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

