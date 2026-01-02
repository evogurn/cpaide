import React, { useState, useEffect } from "react";
import { useTheme } from "../hooks/useTheme";
import { accentColors, backgroundColors, fontOptions } from "../data/index";

const AppearancePanel = ({ isOpen, onClose }) => {
  const {
    accentColor,
    backgroundColor,
    themeMode,
    fontFamily,
    updateAccentColor,
    updateBackgroundColor,
    updateThemeMode,
    updateFontFamily,
  } = useTheme();

  // Local state for temporary changes before saving
  const [localThemeMode, setLocalThemeMode] = useState(themeMode);
  const [localFontFamily, setLocalFontFamily] = useState(fontFamily);
  const [localBackgroundColor, setLocalBackgroundColor] =
    useState(backgroundColor);

  // Update local state when theme changes from external sources
  useEffect(() => {
    setLocalThemeMode(themeMode);
    setLocalFontFamily(fontFamily);
    setLocalBackgroundColor(backgroundColor);
  }, [themeMode, fontFamily, backgroundColor]);

  // Apply theme mode changes immediately for preview
  useEffect(() => {
    if (localThemeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else if (localThemeMode === "light") {
      document.documentElement.classList.remove("dark");
    } else if (localThemeMode === "system") {
      // Check system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [localThemeMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only apply system theme changes if user has selected "system" mode
      if (localThemeMode === "system") {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [localThemeMode]);

  // Apply background color changes immediately for preview
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--background",
      localBackgroundColor
    );
  }, [localBackgroundColor]);

  // Apply font changes immediately for preview
  useEffect(() => {
    document.body.style.fontFamily = localFontFamily;
  }, [localFontFamily]);

  const handleSave = () => {
    // Update theme with new settings
    updateThemeMode(localThemeMode);
    updateFontFamily(localFontFamily);
    updateBackgroundColor(localBackgroundColor);

    // Close the panel
    onClose();
  };

  // Close panel when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>

      {/* Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="relative w-screen max-w-xs">
          <div className="h-full flex flex-col bg-white dark:bg-dark-bg-secondary shadow-xl">
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                  Appearance
                </h2>
                <button
                  type="button"
                  className="ml-3 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-500 dark:text-dark-text-secondary dark:hover:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-8">
                <div className="space-y-8">
                  {/* Theme Mode */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">
                      Theme Mode
                    </h3>
                    <div className="mt-4 flex space-x-4">
                      <button
                        onClick={() => setLocalThemeMode("light")}
                        className={`flex-1 py-1 px-2 rounded-lg border ${
                          localThemeMode === "light"
                            ? "border-accent bg-accent-light text-accent-contrast"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setLocalThemeMode("dark")}
                        className={`flex-1 py-1 px-2 rounded-lg border ${
                          localThemeMode === "dark"
                            ? "border-accent bg-accent-light text-accent-contrast"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                        }`}
                      >
                        Dark
                      </button>
                      <button
                        onClick={() => setLocalThemeMode("system")}
                        className={`flex-1 py-1 px-2 rounded-lg border ${
                          localThemeMode === "system"
                            ? "border-accent bg-accent-light text-accent-contrast"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                        }`}
                      >
                        System
                      </button>
                    </div>
                  </div>
                  <hr className="dark:border-dark-border" />

                  {/* Accent Color */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">
                      Accent Color
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-4 gap-3">
                        {accentColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateAccentColor(color)}
                            className={`h-10 w-10 rounded-full border-2 ${
                              accentColor === color
                                ? "border-gray-900 ring-2 ring-offset-2 ring-accent dark:border-dark-text-primary"
                                : "border-gray-300 dark:border-dark-border"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select ${color} accent color`}
                          />
                        ))}

                        {/* Custom color picker */}
                        <div className="flex items-center text-sm space-x-2">
                          <p className="text-gray-700 dark:text-dark-text-primary">Custom</p>
                          <div className="relative border-2 border-gray-300 dark:border-dark-border">
                            <input
                              type="color"
                              value={accentColor}
                              onChange={(e) =>
                                updateAccentColor(e.target.value)
                              }
                              className="h-10 w-10 rounded-full cursor-pointer bg-transparent"
                            />
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{ backgroundColor: accentColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="dark:border-dark-border" />

                  {/* Background Color */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">
                      Background Color
                    </h3>
                    <div className="mt-4">
                      <div className="grid grid-cols-4 gap-3">
                        {backgroundColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setLocalBackgroundColor(color)}
                            className={`h-10 w-10 rounded-full border-2 ${
                              localBackgroundColor === color
                                ? "border-gray-900 ring-2 ring-offset-2 ring-accent dark:border-dark-text-primary"
                                : "border-gray-300 dark:border-dark-border"
                            }`}
                            style={{ backgroundColor: color }}
                            aria-label={`Select ${color} background color`}
                          />
                        ))}

                        {/* Custom background color picker */}
                        <div className="flex items-center text-sm space-x-2">
                          <p className="text-gray-700 dark:text-dark-text-primary">Custom</p>
                          <div className="relative border-2 border-gray-300 dark:border-dark-border">
                            <input
                              type="color"
                              value={localBackgroundColor}
                              onChange={(e) =>
                                setLocalBackgroundColor(e.target.value)
                              }
                              className="h-10 w-10 rounded-full border-2 border-gray-300 cursor-pointer bg-transparent dark:border-dark-border"
                            />
                            <div
                              className="absolute inset-0 rounded-full pointer-events-none"
                              style={{ backgroundColor: localBackgroundColor }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr className="dark:border-dark-border" />

                  {/* Font Family */}
                  <div>
                    <h3 className="text-md font-medium text-gray-900 dark:text-dark-text-primary">
                      Font Family
                    </h3>
                    <div className="mt-4 space-y-3">
                      {fontOptions.map((font) => (
                        <button
                          key={font.value}
                          onClick={() => setLocalFontFamily(font.value)}
                          className={`w-full text-left py-3 px-4 rounded-lg border ${
                            localFontFamily === font.value
                              ? "border-accent bg-accent-light text-accent-contrast"
                              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:bg-dark-bg-tertiary dark:text-dark-text-primary dark:hover:bg-dark-bg-primary"
                          }`}
                          style={{ fontFamily: font.value }}
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 py-4 px-4 sm:px-6 dark:border-dark-border">
              <button
                type="button"
                onClick={handleSave}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-accent text-base font-medium text-accent-contrast hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent sm:text-sm"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AppearancePanel;