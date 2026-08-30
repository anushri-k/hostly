import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Structural tokens (themeable via CSS variables)
        canvas: 'var(--canvas)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        sidebar: 'var(--sidebar)',
        line: {
          DEFAULT: 'var(--line)',
          soft: 'var(--line-soft)',
          strong: 'var(--line-strong)',
        },
        ink: {
          DEFAULT: 'var(--ink)',
          muted: 'var(--ink-muted)',
          faint: 'var(--ink-faint)',
        },
        // Brand + accents (fixed)
        graphite: '#1D1F24',
        emerald: {
          DEFAULT: '#0EA76B',
          dark: '#0B7A4F',
          tint: 'var(--emerald-tint)',
        },
        amber: {
          DEFAULT: '#F59E0B',
          dark: '#B45309',
          tint: 'var(--amber-tint)',
        },
        info: {
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
          tint: 'var(--info-tint)',
        },
        violet: {
          DEFAULT: '#8B5CF6',
          dark: '#6D28D9',
          tint: 'var(--violet-tint)',
        },
        danger: {
          DEFAULT: '#EF4444',
          dark: '#DC2626',
          tint: 'var(--danger-tint)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-newsreader)', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(29,31,36,0.05)',
        pop: '0 16px 40px rgba(0,0,0,0.12)',
        drawer: '-12px 0 40px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'ho-fade': { from: { opacity: '0' }, to: { opacity: '1' } },
        'ho-rise': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'ho-pop': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ho-pulse': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.4' } },
      },
      animation: {
        'ho-fade': 'ho-fade 0.2s ease both',
        'ho-rise': 'ho-rise 0.22s ease both',
        'ho-pop': 'ho-pop 0.16s ease both',
        'ho-pulse': 'ho-pulse 1.6s ease infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
