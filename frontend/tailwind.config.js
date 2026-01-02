export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
          contrast: 'var(--accent-contrast)',
        },
        // Add dark mode specific color variables
        'dark-bg': {
          primary: '#111827',    // gray-900
          secondary: '#1f2937',  // gray-800
          tertiary: '#374151',   // gray-700
        },
        'dark-text': {
          primary: '#f9fafb',    // gray-50
          secondary: '#d1d5db',  // gray-300
          disabled: '#9ca3af',   // gray-400
        },
        'dark-border': '#4b5563', // gray-600
      },
      backgroundColor: {
        app: 'var(--background)',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif'],
        'system': ['system-ui', 'sans-serif'],
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'],
      }
    },
  },
  plugins: [],
}