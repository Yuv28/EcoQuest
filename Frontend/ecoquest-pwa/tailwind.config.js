/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#0d1a0d',
          900: '#1a2e1a',
          800: '#1e3a1e',
          700: '#2d5a2d',
          600: '#3a7a3a',
          500: '#52a852',
          400: '#74c874',
          300: '#a0e0a0',
        },
        moss:  { DEFAULT: '#8fbc8f', light: '#c2e0c2' },
        amber: { quest: '#f5a623', glow: '#ffcc00' },
        earth: { DEFAULT: '#8b6914', light: '#c49a2a' },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up':    'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%':   { boxShadow: '0 0 5px #74c87440' },
          '100%': { boxShadow: '0 0 20px #74c87480, 0 0 40px #74c87420' },
        }
      }
    }
  },
  plugins: []
}
