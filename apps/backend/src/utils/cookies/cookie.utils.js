import 'dotenv/config';

// Detect production environment
const isProd = process.env.NODE_ENV === 'production';
const isHttps = process.env.NODE_ENV === 'production';

/**
 * Cookie configuration for different environments
 */
const getCookieConfig = (maxAge) => ({
  httpOnly: true,
  secure: isHttps,
  sameSite: isProd ? "none" : "lax",
  maxAge,
  path: '/',
});

/**
 * Set refresh token cookie (7 days)
 */
export const setRefreshTokenCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie("refreshToken", token, getCookieConfig(maxAge));
};

/**
 * Set access token cookie (15 minutes) - NOT httpOnly for Socket.IO access
 */
export const setAccessTokenCookie = (res, token) => {
  const maxAge = 15 * 60 * 1000; // 15 minutes
  res.cookie("accessToken", token, {
    httpOnly: false, // Allow JavaScript access for Socket.IO
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path: '/',
  });
};

/**
 * Set user role cookie (non-httpOnly for client access)
 */
export const setUserRoleCookie = (res, role) => {
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  res.cookie("userRole", role, {
    httpOnly: false,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    maxAge,
    path: '/',
  });
};

/**
 * Set all authentication cookies including user role
 */
export const setAllAuthCookies = (res, tokens, user) => {
  setAccessTokenCookie(res, tokens.accessToken);
  setRefreshTokenCookie(res, tokens.refreshToken);
  if (user && user.role) {
    setUserRoleCookie(res, user.role);
  }
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res) => {
  const clearConfig = {
    httpOnly: true,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  };
  
  res.clearCookie("accessToken", {
    httpOnly: false,
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  });
  res.clearCookie("refreshToken", clearConfig);
  res.clearCookie("token", {
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  });
  res.clearCookie("userRole", {
    secure: isHttps,
    sameSite: isProd ? "none" : "lax",
    path: '/',
  });
};

