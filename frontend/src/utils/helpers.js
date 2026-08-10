/**
 * Utility helper functions for the Lost and Found Portal
 * Contains commonly used functions across the application
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns';

/**
 * Format a date to a readable string
 * @param {string|Date} date - The date to format
 * @param {string} formatStr - The format string (optional)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'MMM dd, yyyy • hh:mm a') => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Get time ago string (e.g., "2 hours ago")
 * @param {string|Date} date - The date to compare
 * @returns {string} Time ago string
 */
export const timeAgo = (date) => {
  if (!date) return 'N/A';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Truncate text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} length - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, length = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

/**
 * Capitalize the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} Validation result
 */
export const validatePassword = (password) => {
  const result = {
    isValid: false,
    errors: [],
    strength: 'weak'
  };

  if (!password || password.length < 6) {
    result.errors.push('Password must be at least 6 characters');
  }
  if (!/[A-Z]/.test(password)) {
    result.errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    result.errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    result.errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    result.errors.push('Password must contain at least one special character');
  }

  if (result.errors.length === 0) {
    result.isValid = true;
    result.strength = 'strong';
  } else if (result.errors.length <= 2) {
    result.strength = 'medium';
  }

  return result;
};

/**
 * Generate a random ID
 * @param {number} length - Length of the ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Debounce a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function call
 * @param {Function} func - The function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {object} obj - The object to clone
 * @returns {object} Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    Object.keys(obj).forEach(key => {
      clonedObj[key] = deepClone(obj[key]);
    });
    return clonedObj;
  }
  return obj;
};

/**
 * Check if object is empty
 * @param {object} obj - The object to check
 * @returns {boolean} True if empty
 */
export const isEmptyObject = (obj) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

/**
 * Get file extension from filename
 * @param {string} filename - The filename
 * @returns {string} File extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is an image
 * @param {string} filename - The filename
 * @returns {boolean} True if image
 */
export const isImageFile = (filename) => {
  const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
  const ext = getFileExtension(filename);
  return extensions.includes(ext);
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Get initials from name
 * @param {string} name - The full name
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Get random color for avatar
 * @param {string} seed - Seed string for consistent color
 * @returns {string} Color code
 */
export const getAvatarColor = (seed) => {
  const colors = [
    '#1976d2', '#2e7d32', '#ed6c02', '#dc004e', 
    '#9c27b0', '#0288d1', '#2e7d32', '#d32f2f',
    '#e65100', '#4527a0', '#00695c', '#ad1457'
  ];
  if (!seed) return colors[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Group array by key
 * @param {Array} array - The array to group
 * @param {string} key - The key to group by
 * @returns {object} Grouped object
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

/**
 * Sort array by key
 * @param {Array} array - The array to sort
 * @param {string} key - The key to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
export const sortBy = (array, key, order = 'asc') => {
  const sorted = [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
};

/**
 * Search in array by text
 * @param {Array} array - The array to search
 * @param {string} searchText - The text to search
 * @param {Array} keys - The keys to search in
 * @returns {Array} Filtered array
 */
export const searchInArray = (array, searchText, keys) => {
  if (!searchText || !array) return array;
  const text = searchText.toLowerCase();
  return array.filter(item => {
    return keys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(text);
      }
      if (typeof value === 'number') {
        return value.toString().includes(text);
      }
      return false;
    });
  });
};

/**
 * Get query parameters from URL
 * @returns {object} Query parameters
 */
export const getQueryParams = () => {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
};

/**
 * Set query parameters in URL
 * @param {object} params - The parameters to set
 */
export const setQueryParams = (params) => {
  const url = new URL(window.location);
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.set(key, params[key]);
    } else {
      url.searchParams.delete(key);
    }
  });
  window.history.pushState({}, '', url);
};

/**
 * Scroll to top of page smoothly
 */
export const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 * @returns {Promise} Promise that resolves when copied
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Download file from URL
 * @param {string} url - The URL to download
 * @param {string} filename - The filename to save as
 */
export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

/**
 * Parse JSON safely
 * @param {string} jsonString - The JSON string to parse
 * @param {any} fallback - Fallback value if parsing fails
 * @returns {any} Parsed JSON or fallback
 */
export const safeJsonParse = (jsonString, fallback = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return fallback;
  }
};

/**
 * Get status color mapping
 * @param {string} status - The status string
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  const colors = {
    open: '#4caf50',
    closed: '#f44336',
    claimed: '#ff9800',
    available: '#4caf50',
    pending: '#ff9800',
    accepted: '#4caf50',
    rejected: '#f44336',
    completed: '#2196f3',
    active: '#4caf50',
    inactive: '#9e9e9e'
  };
  return colors[status] || '#9e9e9e';
};

/**
 * Get status label
 * @param {string} status - The status string
 * @returns {string} Formatted status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    open: 'Open',
    closed: 'Closed',
    claimed: 'Claimed',
    available: 'Available',
    pending: 'Pending',
    accepted: 'Accepted',
    rejected: 'Rejected',
    completed: 'Completed',
    active: 'Active',
    inactive: 'Inactive'
  };
  return labels[status] || status;
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * Format currency
 * @param {number} amount - The amount
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Get current year
 * @returns {number} Current year
 */
export const getCurrentYear = () => {
  return new Date().getFullYear();
};

/**
 * Check if running in production environment
 * @returns {boolean} True if production
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Get environment variable with fallback
 * @param {string} key - The environment variable key
 * @param {any} fallback - Fallback value
 * @returns {any} Environment variable value
 */
export const getEnv = (key, fallback = null) => {
  return process.env[key] || fallback;
};

/**
 * Create slug from string
 * @param {string} text - The text to slugify
 * @returns {string} Slug
 */
export const createSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Get reading time for text
 * @param {string} text - The text to calculate
 * @param {number} wordsPerMinute - Reading speed (default: 200)
 * @returns {number} Reading time in minutes
 */
export const getReadingTime = (text, wordsPerMinute = 200) => {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

/**
 * Check if browser supports a feature
 * @param {string} feature - The feature to check
 * @returns {boolean} True if supported
 */
export const isBrowserFeatureSupported = (feature) => {
  const features = {
    localStorage: () => !!window.localStorage,
    sessionStorage: () => !!window.sessionStorage,
    serviceWorker: () => 'serviceWorker' in navigator,
    geolocation: () => 'geolocation' in navigator,
    clipboard: () => navigator.clipboard && !!navigator.clipboard.writeText,
    notifications: () => 'Notification' in window,
    webShare: () => 'share' in navigator,
    webRTC: () => 'RTCPeerConnection' in window,
    webGL: () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && 
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }
  };
  return features[feature] ? features[feature]() : false;
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 * @returns {Promise} Promise
 */
export const showNotification = async (title, options = {}) => {
  if (!isBrowserFeatureSupported('notifications')) {
    console.warn('Notifications not supported');
    return;
  }
  
  if (Notification.permission === 'granted') {
    return new Notification(title, options);
  }
  
  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      return new Notification(title, options);
    }
  }
};

/**
 * Detect user's device type
 * @returns {string} 'mobile', 'tablet', or 'desktop'
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Detect user's browser
 * @returns {string} Browser name
 */
export const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) return 'Safari';
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) return 'Internet Explorer';
  if (ua.indexOf('Edg') > -1) return 'Edge';
  return 'Unknown';
};

/**
 * Get user's timezone
 * @returns {string} Timezone name
 */
export const getUserTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Get user's language
 * @returns {string} Language code
 */
export const getUserLanguage = () => {
  return navigator.language || 'en-US';
};

/**
 * Create an object URL from a file
 * @param {File} file - The file
 * @returns {string} Object URL
 */
export const createObjectURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke an object URL
 * @param {string} url - The object URL to revoke
 */
export const revokeObjectURL = (url) => {
  URL.revokeObjectURL(url);
};

/**
 * Convert base64 to Blob
 * @param {string} base64 - Base64 string
 * @param {string} contentType - MIME type
 * @returns {Blob} Blob object
 */
export const base64ToBlob = (base64, contentType = 'image/png') => {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  return new Blob(byteArrays, { type: contentType });
};

/**
 * Convert Blob to base64
 * @param {Blob} blob - The blob
 * @returns {Promise} Promise resolving to base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Get random color
 * @returns {string} Random hex color
 */
export const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Check if string is valid JSON
 * @param {string} str - The string to check
 * @returns {boolean} True if valid JSON
 */
export const isValidJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Escape HTML special characters
 * @param {string} html - The HTML string
 * @returns {string} Escaped string
 */
export const escapeHtml = (html) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return html.replace(/[&<>"']/g, function(m) { return map[m]; });
};

/**
 * Unescape HTML special characters
 * @param {string} html - The HTML string
 * @returns {string} Unescaped string
 */
export const unescapeHtml = (html) => {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'"
  };
  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(m) { return map[m]; });
};

/**
 * Get array of months
 * @param {string} format - Format ('short' or 'long')
 * @returns {Array} Array of months
 */
export const getMonths = (format = 'short') => {
  const months = format === 'short' 
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months;
};

/**
 * Get array of days
 * @param {string} format - Format ('short' or 'long')
 * @returns {Array} Array of days
 */
export const getDays = (format = 'short') => {
  const days = format === 'short'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days;
};

/**
 * Convert to title case
 * @param {string} str - The string to convert
 * @returns {string} Title case string
 */
export const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

/**
 * Convert to snake case
 * @param {string} str - The string to convert
 * @returns {string} Snake case string
 */
export const toSnakeCase = (str) => {
  return str
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '');
};

/**
 * Convert to camel case
 * @param {string} str - The string to convert
 * @returns {string} Camel case string
 */
export const toCamelCase = (str) => {
  return str
    .replace(/\s+/g, ' ')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
      return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Add ordinal suffix to number
 * @param {number} num - The number
 * @returns {string} Number with ordinal suffix
 */
export const addOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
};

/**
 * Wait for a specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a promise with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} maxRetries - Maximum retries
 * @param {number} initialDelay - Initial delay in ms
 * @returns {Promise} Promise
 */
export const retry = async (fn, maxRetries = 3, initialDelay = 1000) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

/**
 * Batch process array items
 * @param {Array} items - The items to process
 * @param {Function} processor - Processing function
 * @param {number} batchSize - Batch size
 * @returns {Promise} Promise
 */
export const batchProcess = async (items, processor, batchSize = 10) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
};

export default {
  formatDate,
  timeAgo,
  truncateText,
  capitalizeFirst,
  isValidEmail,
  isValidPhone,
  validatePassword,
  generateId,
  debounce,
  throttle,
  deepClone,
  isEmptyObject,
  getFileExtension,
  isImageFile,
  formatFileSize,
  getInitials,
  getAvatarColor,
  groupBy,
  sortBy,
  searchInArray,
  getQueryParams,
  setQueryParams,
  scrollToTop,
  copyToClipboard,
  downloadFile,
  safeJsonParse,
  getStatusColor,
  getStatusLabel,
  calculateDistance,
  formatCurrency,
  getCurrentYear,
  isProduction,
  getEnv,
  createSlug,
  getReadingTime,
  isBrowserFeatureSupported,
  showNotification,
  getDeviceType,
  getBrowser,
  getUserTimezone,
  getUserLanguage,
  createObjectURL,
  revokeObjectURL,
  base64ToBlob,
  blobToBase64,
  getRandomColor,
  isValidJson,
  escapeHtml,
  unescapeHtml,
  getMonths,
  getDays,
  toTitleCase,
  toSnakeCase,
  toCamelCase,
  addOrdinalSuffix,
  sleep,
  retry,
  batchProcess
};