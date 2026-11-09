/** Design tokens live here. Never hard-code hex values in components. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        space: { DEFAULT: '#0B0D17', raised: '#121528', line: 'rgba(255,255,255,0.08)' },
        primary: { DEFAULT: '#00D4FF', soft: 'rgba(0,212,255,0.15)' },
        healthy: { DEFAULT: '#00FF9C', soft: 'rgba(0,255,156,0.15)' },
        warning: { DEFAULT: '#FFB020', soft: 'rgba(255,176,32,0.15)' },
        emergency: { DEFAULT: '#FC3D21', soft: 'rgba(252,61,33,0.18)' },
        ink: { DEFAULT: '#E8ECF8', muted: '#8A92B2' },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(0,212,255,0.25)',
        'glow-healthy': '0 0 24px rgba(0,255,156,0.25)',
        'glow-emergency': '0 0 24px rgba(252,61,33,0.35)',
      },
      borderRadius: { card: '1rem' },
    },
  },
  plugins: [],
}
