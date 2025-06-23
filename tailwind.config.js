/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Professional Healthcare Color Palette
        primary: {
          50: '#e6f2ff',   // Lightest blue
          100: '#b3d9ff',  // Light blue
          200: '#80bfff',  // Soft blue
          300: '#4da6ff',  // Bright blue
          400: '#1a8cff',  // Strong blue
          500: '#0073e6',  // Deep blue (main)
          600: '#005cb3',  // Dark blue
          700: '#004080',  // Darker blue
          800: '#00264d',  // Darkest blue
          900: '#001a33'   // Almost black blue
        },
        secondary: {
          50: '#f0f9f5',   // Lightest teal
          100: '#b3e0cc',  // Light teal
          200: '#80cca3',  // Soft teal
          300: '#4db380',  // Bright teal
          400: '#1a9966',  // Strong teal
          500: '#00804d',  // Deep teal (main)
          600: '#00663d',  // Dark teal
          700: '#004d2e',  // Darker teal
          800: '#00331e',  // Darkest teal
          900: '#001a0f'   // Almost black teal
        },
        // Neutral colors with a medical feel
        neutral: {
          50: '#f5f7fa',   // Very light gray
          100: '#e4e7eb',  // Light gray
          200: '#cbd2d9',  // Soft gray
          300: '#9aa5b1',  // Medium gray
          400: '#7b8794',  // Dark gray
          500: '#616e7c',  // Deeper gray
          600: '#4a5568',  // Darkest gray
          700: '#3c4252',  // Almost black gray
          800: '#2d3748',  // Deep gray
          900: '#1a202c'   // Darkest gray
        },
        // Accent colors
        accent: {
          success: '#48bb78',   // Green for success
          warning: '#ecc94b',   // Yellow for warnings
          danger: '#f56565',    // Red for errors
          info: '#4299e1'       // Blue for information
        }
      },
      fontFamily: {
        // Professional, clean font stack
        sans: [
          'Inter', 
          'system-ui', 
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Oxygen', 
          'Ubuntu', 
          'Cantarell', 
          'Open Sans', 
          'Helvetica Neue', 
          'sans-serif'
        ]
      },
      boxShadow: {
        // Subtle, professional shadows
        DEFAULT: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 6px 12px -2px rgba(0, 0, 0, 0.1), 0 3px 6px -3px rgba(0, 0, 0, 0.07)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      borderRadius: {
        // More refined border radius
        DEFAULT: '0.375rem',  // 6px
        lg: '0.5rem',         // 8px
        xl: '0.75rem',        // 12px
        '2xl': '1rem'         // 16px
      }
    },
  },
  plugins: [],
};
