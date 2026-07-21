/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware Graphite Colors via CSS variables
        graphite: {
          950: 'rgb(var(--c-graphite-950) / <alpha-value>)',
          900: 'rgb(var(--c-graphite-900) / <alpha-value>)',
          850: 'rgb(var(--c-graphite-850) / <alpha-value>)',
          800: 'rgb(var(--c-graphite-800) / <alpha-value>)',
          700: 'rgb(var(--c-graphite-700) / <alpha-value>)',
          600: 'rgb(var(--c-graphite-600) / <alpha-value>)',
          500: '#64748B',
        },
        // Theme-aware Slate Colors via CSS variables
        slate: {
          100: 'rgb(var(--c-slate-100) / <alpha-value>)',
          200: 'rgb(var(--c-slate-200) / <alpha-value>)',
          300: 'rgb(var(--c-slate-300) / <alpha-value>)',
          400: 'rgb(var(--c-slate-400) / <alpha-value>)',
          500: 'rgb(var(--c-slate-500) / <alpha-value>)',
        },
        // Signal Colors (Vibrant in both Dark & Light themes)
        signal: {
          green:  '#10B981',
          amber:  '#F59E0B',
          orange: '#F97316',
          red:    '#EF4444',
          purple: '#8B5CF6',
        },
        // Brand & Accent Colors
        brand: {
          indigo: '#4F378A',
          purple: '#6750A4',
          gold:   '#C9A74D',
        },
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans:  ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono:  ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-red':    '0 0 20px rgba(239, 68, 68, 0.35)',
        'glow-amber':  '0 0 20px rgba(245, 158, 11, 0.35)',
        'glow-green':  '0 0 20px rgba(16, 185, 129, 0.35)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.35)',
      },
    },
  },
  plugins: [],
};
