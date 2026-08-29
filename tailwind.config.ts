import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        wall: {
          DEFAULT: '#131217',
          deep: '#0a090d',
          raised: '#1c1a22',
          soft: '#23212b',
          edge: '#322f3b',
        },
        bone: '#f2efe6',
        ash: '#9d9aa4',
        chalk: '#d8d4ca',
        ink: '#0a090d',
        tape: '#84cc16',
        marker: '#ff2d4a',
        wash: '#23e0a0',
        /** rewritten at runtime by the colour wall */
        accent: 'var(--accent, #84cc16)',
        'accent-ink': 'var(--accent-ink, #0a090d)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.045em',
      },
      gridTemplateColumns: {
        /* The colour wall runs 14 swatches per family — Tailwind stops at 12,
           and without this the class silently no-ops and every family wraps
           two orphans onto a second row. */
        14: 'repeat(14, minmax(0, 1fr))',
      },
      boxShadow: {
        /* Hard, unblurred offsets. A blurred shadow reads as a web card; a
           pasted poster casts a hard edge. */
        slab: '10px 10px 0 #0a090d',
        'slab-sm': '6px 6px 0 #0a090d',
        'slab-lg': '16px 16px 0 #0a090d',
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
      keyframes: {
        rise: {
          '0%': { transform: 'translateY(18px)', opacity: '0', filter: 'blur(4px)' },
          '60%': { filter: 'blur(0)' },
          '100%': { transform: 'translateY(0)', opacity: '1', filter: 'blur(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
