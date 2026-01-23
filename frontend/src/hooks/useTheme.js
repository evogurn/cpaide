import { useState, useEffect } from 'react';
import { applyTheme, applyThemeMode, getSavedTheme, saveTheme } from '../utils/themeUtils';

const DEFAULT_ACCENT_COLOR = '#3b82f6'; // blue-500
const DEFAULT_BACKGROUND_COLOR = '#f9fafb'; // gray-50
const DEFAULT_THEME_MODE = 'light';
const DEFAULT_FONT_FAMILY = 'inter';

// Get saved theme or default values
const getInitialTheme = () => {
  const savedTheme = getSavedTheme();
  return {
    accentColor: savedTheme?.accentColor || DEFAULT_ACCENT_COLOR,
    backgroundColor: savedTheme?.backgroundColor || DEFAULT_BACKGROUND_COLOR,
    themeMode: savedTheme?.themeMode || DEFAULT_THEME_MODE,
    fontFamily: savedTheme?.fontFamily || DEFAULT_FONT_FAMILY
  };
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme mode whenever it changes
  useEffect(() => {
    applyThemeMode(theme.themeMode);
  }, [theme.themeMode]);

  // Apply theme colors whenever they change
  useEffect(() => {
    applyTheme(theme.accentColor, theme.backgroundColor);
  }, [theme.accentColor, theme.backgroundColor]);

  // Save theme to localStorage whenever any property changes
  useEffect(() => {
    saveTheme({ 
      accentColor: theme.accentColor, 
      backgroundColor: theme.backgroundColor,
      themeMode: theme.themeMode,
      fontFamily: theme.fontFamily
    });
  }, [theme]);

  const updateAccentColor = (newAccentColor) => {
    setTheme(prev => ({ ...prev, accentColor: newAccentColor }));
  };

  const updateBackgroundColor = (newBackgroundColor) => {
    setTheme(prev => ({ ...prev, backgroundColor: newBackgroundColor }));
  };
  
  const updateThemeMode = (newThemeMode) => {
    setTheme(prev => ({ ...prev, themeMode: newThemeMode }));
  };
  
  const updateFontFamily = (newFontFamily) => {
    setTheme(prev => ({ ...prev, fontFamily: newFontFamily }));
  };

  return {
    accentColor: theme.accentColor,
    backgroundColor: theme.backgroundColor,
    themeMode: theme.themeMode,
    fontFamily: theme.fontFamily,
    updateAccentColor,
    updateBackgroundColor,
    updateThemeMode,
    updateFontFamily
  };
};