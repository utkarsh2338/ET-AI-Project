/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Command Center (Dark Mode) Graphite Theme
        graphite: {
          950: '#0B0D11',
          900: '#14181F', // Main command center background
          850: '#1A202A', // Panel background
          800: '#222A36', // Card background
          700: '#2E3848', // Border / Divider
          600: '#425066', // Subtle text / icon
          500: '#64748B',
        },
        // Signal Colors
        signal: {
          green:  '#10B981', // Low risk / safe
          amber:  '#F59E0B', // Medium risk / warning
          orange: '#F97316', // High risk
          red:    '#EF4444', // Critical risk
          purple: '#8B5CF6', // Impersonation / Network node
        },
        // Brand & Accent
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
