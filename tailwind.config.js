/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: {
            50:  '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#1d4ed8',
            700: '#1e3a8a',
            800: '#0f2460',
            900: '#060e2b',
            950: '#030820',
          },
          yellow: {
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
          },
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #060e2b 0%, #0f2460 45%, #1d4ed8 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(6,14,43,0.80) 0%, rgba(6,14,43,0.72) 45%, rgba(6,14,43,0.92) 100%)',
        'card-glass': 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        'yellow-glow': 'radial-gradient(ellipse at center, rgba(250,204,21,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'glass': '0 8px 30px rgba(15,36,96,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
        'yellow-glow': '0 8px 30px rgba(245,158,11,0.25)',
        'blue-glow': '0 8px 30px rgba(29,78,216,0.18)',
        'input': '0 2px 8px rgba(15,36,96,0.06)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
}
