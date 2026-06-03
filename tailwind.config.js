/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0eaff',
          100: '#ddd0ff',
          200: '#c4aaff',
          300: '#a67cff',
          400: '#8b53f7',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#2e1065',
        },
        aurora: {
          teal:   '#06b6d4',
          pink:   '#ec4899',
          violet: '#8b5cf6',
          indigo: '#6366f1',
        },
        surface: {
          0:  '#060810',
          1:  '#0a0e1a',
          2:  '#0f1525',
          3:  '#141c30',
          4:  '#1a2340',
          5:  '#202b50',
        },
        glass: {
          white: 'rgba(255,255,255,0.06)',
          whiteMd: 'rgba(255,255,255,0.10)',
          border: 'rgba(255,255,255,0.08)',
          borderMd: 'rgba(255,255,255,0.15)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #0a0e1a 0%, #0f0a1e 30%, #0a1628 60%, #060810 100%)',
        'brand-gradient': 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        'card-gradient': 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.06))',
      },
      boxShadow: {
        'glow-brand': '0 0 30px rgba(124,58,237,0.35)',
        'glow-teal':  '0 0 30px rgba(6,182,212,0.35)',
        'glow-sm':    '0 0 15px rgba(124,58,237,0.25)',
        'card':       '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(124,58,237,0.30), 0 4px 24px rgba(0,0,0,0.5)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float':        'float 6s ease-in-out infinite',
        'pulse-slow':   'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer':      'shimmer 1.8s linear infinite',
        'gradient-x':   'gradient-x 8s ease infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
};
