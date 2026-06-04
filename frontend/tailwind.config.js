/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F7F3FB',
          100: '#EEE3F6',
          200: '#DCC7EC',
          300: '#C2A1DC',
          400: '#A273C6',
          500: '#8348A9',
          600: '#6A3290',
          700: '#4A1D6E',
          DEFAULT: '#5E2A8C',
          foreground: '#FFFFFF',
        },
        accent: {
          soft: '#FFEDE8',
          DEFAULT: '#FF6F50',
          strong: '#E8512F',
          foreground: '#4A1606',
        },
        success: '#12A150',
        warning: '#F59E0B',
        info: '#2D7FF9',
        destructive: '#E5484D',
        appbg: '#F4F0F9',
        muted: {
          DEFAULT: '#F5F2F9',
          foreground: '#736B82',
        },
        border: '#E9E2F1',
        card: '#FFFFFF',
        foreground: '#221A2E',
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '14px',
        lg: '20px',
        xl: '34px',
        full: '9999px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        mono: ['"Space Grotesk"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        1: '0 1px 2px rgba(46,22,71,.05), 0 1px 3px rgba(46,22,71,.07)',
        2: '0 2px 6px rgba(46,22,71,.06), 0 10px 24px rgba(46,22,71,.09)',
        3: '0 12px 32px rgba(46,22,71,.11), 0 30px 60px rgba(46,22,71,.13)',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(255,111,80,0.4)' },
          '50%': { transform: 'scale(1.015)', boxShadow: '0 0 0 12px rgba(255,111,80,0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
        'spin': {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        breathe: 'breathe 3.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.45s cubic-bezier(.2,.7,.2,1) both',
        'scale-in': 'scale-in 0.4s cubic-bezier(.2,.7,.2,1) both',
        'slide-up': 'slide-up 0.32s cubic-bezier(.2,.7,.2,1) both',
        'ring-pulse': 'ring-pulse 1s ease-out infinite',
        'draw-check': 'draw-check 0.5s ease-out both',
        'spin': 'spin 0.8s linear infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
