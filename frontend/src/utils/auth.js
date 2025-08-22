/**
 * Utility functions for authentication and role management
 */

/**
 * Decode JWT token and extract user information
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token data or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get current user role from stored token
 * @returns {string|null} - User role or null if not found
 */
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

/**
 * Get current user ID from stored token
 * @returns {string|null} - User ID or null if not found
 */
export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.userId || null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user has valid token
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const decoded = decodeToken(token);
  if (!decoded) return false;
  
  // Check if token is expired
  const currentTime = Date.now() / 1000;
  return decoded.exp > currentTime;
};

/**
 * Check if user is admin
 * @returns {boolean} - True if user has admin role
 */
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

/**
 * Check if user is regular user
 * @returns {boolean} - True if user has user role
 */
export const isUser = () => {
  const role = getUserRole();
  return role === 'user';
};

/**
 * Clear authentication data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
