/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#030712',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(56, 189, 248, 0.2)',
          teal: '#00E5FF',
          paypal: '#0079C1',
          paypalDark: '#00457C',
          emerald: '#10B981',
          amber: '#F59E0B',
          purple: '#A855F7',
          rose: '#F43F5E',
        }
      },
      boxShadow: {
        'glow-teal': '0 0 20px -3px rgba(0, 229, 255, 0.35)',
        'glow-paypal': '0 0 20px -3px rgba(0, 121, 193, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
