/**
 * Utility functions for theme management
 */

/**
 * Lightens a color by a given percentage
 * @param {string} hex - Hex color code (e.g., '#3b82f6')
 * @param {number} percent - Percentage to lighten (0-100)
 * @returns {string} Lightened hex color
 */
export const lightenColor = (hex, percent) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Lighten each component
  r = Math.min(255, r + Math.round((255 - r) * (percent / 100)));
  g = Math.min(255, g + Math.round((255 - g) * (percent / 100)));
  b = Math.min(255, b + Math.round((255 - b) * (percent / 100)));
  
  // Convert back to hex
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

/**
 * Darkens a color by a given percentage
 * @param {string} hex - Hex color code (e.g., '#3b82f6')
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
export const darkenColor = (hex, percent) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken each component
  r = Math.max(0, r - Math.round(r * (percent / 100)));
  g = Math.max(0, g - Math.round(g * (percent / 100)));
  b = Math.max(0, b - Math.round(b * (percent / 100)));
  
  // Convert back to hex
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
};

/**
 * Calculates the best contrast color (black or white) for a given background color
 * @param {string} hex - Hex color code (e.g., '#3b82f6')
 * @returns {string} '#000000' or '#ffffff'
 */
export const getContrastColor = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse r, g, b values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Applies theme colors to CSS variables
 * @param {string} accentHex - Accent color in hex format
 * @param {string} backgroundHex - Background color in hex format (optional)
 */
export const applyTheme = (accentHex, backgroundHex = null) => {
  const lightHex = lightenColor(accentHex, 10);
  const darkHex = darkenColor(accentHex, 10);
  const contrastHex = getContrastColor(accentHex);
  
  // Apply to CSS variables
  const root = document.documentElement;
  root.style.setProperty('--accent', accentHex);
  root.style.setProperty('--accent-light', lightHex);
  root.style.setProperty('--accent-dark', darkHex);
  root.style.setProperty('--accent-contrast', contrastHex);
  
  // Apply background if provided
  if (backgroundHex) {
    root.style.setProperty('--background', backgroundHex);
  }
};

/**
 * Applies theme mode (light/dark/system) to the document
 * @param {string} mode - Theme mode ('light', 'dark', or 'system')
 */
export const applyThemeMode = (mode) => {
  const root = document.documentElement;
  
  if (mode === 'dark') {
    root.classList.add('dark');
  } else if (mode === 'light') {
    root.classList.remove('dark');
  } else if (mode === 'system') {
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
};

/**
 * Applies font family to the document
 * @param {string} fontFamily - Font family name
 */
export const applyFontFamily = (fontFamily) => {
  document.body.style.fontFamily = fontFamily;
};

/**
 * Gets saved theme from localStorage
 * @returns {Object|null} Theme object or null if not found
 */
export const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem('theme');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

/**
 * Saves theme to localStorage
 * @param {Object} theme - Theme object to save
 */
export const saveTheme = (theme) => {
  try {
    localStorage.setItem('theme', JSON.stringify(theme));
  } catch (e) {
    // Ignore errors
  }
};