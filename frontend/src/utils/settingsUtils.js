/**
 * Utility functions for managing application settings in localStorage
 */

const SETTINGS_KEY = 'appSettings';

/**
 * Gets all saved settings from localStorage
 * @returns {Object} Settings object or empty object if not found
 */
export const getSavedSettings = () => {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
};

/**
 * Saves settings to localStorage
 * @param {Object} settings - Settings object to save
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // Ignore errors
  }
};

/**
 * Gets a specific setting value by key
 * @param {string} key - Setting key (supports dot notation for nested properties)
 * @param {*} defaultValue - Default value to return if setting not found
 * @returns {*} Setting value or default value
 */
export const getSetting = (key, defaultValue = null) => {
  const settings = getSavedSettings();
  
  // Handle nested properties (e.g., 'dashboard.projectLabel')
  if (key.includes('.')) {
    const keys = key.split('.');
    let value = settings;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }
  
  return key in settings ? settings[key] : defaultValue;
};

/**
 * Sets a specific setting value
 * @param {string} key - Setting key (supports dot notation for nested properties)
 * @param {*} value - Value to set
 */
export const setSetting = (key, value) => {
  const settings = getSavedSettings();
  
  // Handle nested properties (e.g., 'dashboard.projectLabel')
  if (key.includes('.')) {
    const keys = key.split('.');
    const lastKey = keys.pop();
    let current = settings;
    
    for (const k of keys) {
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[lastKey] = value;
  } else {
    settings[key] = value;
  }
  
  saveSettings(settings);
};

/**
 * Updates multiple settings at once
 * @param {Object} newSettings - Object containing settings to update
 */
export const updateSettings = (newSettings) => {
  const settings = getSavedSettings();
  Object.assign(settings, newSettings);
  saveSettings(settings);
};