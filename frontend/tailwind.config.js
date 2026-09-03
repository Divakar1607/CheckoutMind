/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef', // Fuchsia/Magenta base
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f', // Deep Violet
          900: '#701a75',
          950: '#4a044e',
        },
        dark: {
          900: '#09090b', // Zinc 950
          800: '#18181b', // Zinc 900
          700: '#27272a', // Zinc 800
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 10px #c026d3, 0 0 20px #c026d3' },
          'to': { boxShadow: '0 0 20px #e879f9, 0 0 30px #e879f9' },
        }
      }
    },
  },
  plugins: [],
}
