import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        'bg-card': '#141414',
        'bg-elevated': '#1C1C1C',
        border: '#2A2A2A',
        'text-primary': '#F0EDE8',
        'text-muted': '#888888',
        'text-faint': '#444444',
        accent: '#C8F135',
        'accent-hover': '#D4F54A',
        danger: '#FF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '4px',
        card: '16px',
      },
      transitionTimingFunction: {
        DEFAULT: 'ease',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s linear infinite',
        'fade-in': 'fade-in 200ms ease',
      },
    },
  },
  plugins: [],
} satisfies Config;
