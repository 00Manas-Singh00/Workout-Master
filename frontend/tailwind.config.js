/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@clerk/clerk-react/dist/esm/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
        slideIn: 'slideIn 0.2s ease-out',
        slideOut: 'slideOut 0.2s ease-in',
        slideInLeft: 'slideInLeft 0.2s ease-out',
        slideInRight: 'slideInRight 0.2s ease-out',
        spin: 'spin 1s linear infinite',
      },
      colors: {
        // Utilitarian: monochrome core
        primary: {
          50:  '#f5f5f5',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#a8a8a8',
          400: '#737373',
          500: '#3d3d3d',
          600: '#2a2a2a',
          700: '#1a1a1a',
          800: '#111111',
          900: '#080808',
          950: '#030303',
        },
        secondary: {
          50:  '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#9a9a9a',
          400: '#6e6e6e',
          500: '#4a4a4a',
          600: '#333333',
          700: '#222222',
          800: '#161616',
          900: '#0a0a0a',
          950: '#050505',
        },
        // Keep a minimal accent — used ONLY for critical CTA actions
        accent: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        success: {
          500: '#22c55e',
          600: '#16a34a',
        },
        error: {
          500: '#ef4444',
          600: '#dc2626',
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans:    ['Space Grotesk', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'xxs': '0.625rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'none': '0',
        'sm':   '2px',
        DEFAULT: '2px',
        'md':   '4px',
        'lg':   '4px',
        'xl':   '4px',
        '2xl':  '4px',
        '3xl':  '4px',
        '4xl':  '4px',
        '5xl':  '4px',
        'full': '9999px',
      },
      boxShadow: {
        // Utilitarian: hard offset, no blur — not soft blurs
        'sm':      '1px 1px 0 0 #111111',
        DEFAULT:   '2px 2px 0 0 #111111',
        'md':      '3px 3px 0 0 #111111',
        'lg':      '4px 4px 0 0 #111111',
        'xl':      '5px 5px 0 0 #111111',
        '2xl':     '6px 6px 0 0 #111111',
        'inner':   'inset 0 1px 0 0 #111111',
        // Dark-mode equivalents
        'sm-light':  '1px 1px 0 0 #ffffff',
        'md-light':  '3px 3px 0 0 #ffffff',
        'lg-light':  '4px 4px 0 0 #ffffff',
        'xl-light':  '5px 5px 0 0 #ffffff',
      },
    },
  },
  plugins: [],
}