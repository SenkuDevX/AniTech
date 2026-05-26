/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#081425',
          dim: '#081425',
          bright: '#2f3a4c',
          'container-lowest': '#040e1f',
          'container-low': '#111c2d',
          container: '#152031',
          'container-high': '#1f2a3c',
          'container-highest': '#2a3548',
        },
        'on-surface': {
          DEFAULT: '#d8e3fb',
          variant: '#c6c6cd',
        },
        background: '#081425',
        'on-background': '#d8e3fb',
        muted: '#0F172A',
        indigo: '#312E81',
        accent: {
          cyan: '#22D3EE',
          violet: '#A78BFA',
          magenta: '#D946EF',
          blue: '#3B82F6',
          gold: '#FDE68A',
        },
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Hanken Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-lg': ['40px', { lineHeight: '1.15', letterSpacing: '-0.03em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6' }],
        'body-md': ['16px', { lineHeight: '1.5' }],
        metadata: ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '500' }],
      },
      spacing: {
        sidebar: '260px',
        'sidebar-collapsed': '80px',
        content: '40px',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.3)',
        ambient: '0 20px 50px rgba(0,0,0,0.5)',
        glow: '0 0 15px rgba(34,211,238,0.4)',
        'glow-violet': '0 0 15px rgba(167,139,250,0.4)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
};
