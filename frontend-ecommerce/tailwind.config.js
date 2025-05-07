/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nolt: {
          orange: '#0E214A', // Midnight blue (darker shade for FC Chalon)
          yellow: '#FFDD00', // FC Chalon yellow
          black: '#0f0f0f',
        }
      },
      fontFamily: {
        thunder: ['Thunder', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
};