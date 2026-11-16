/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8f3eb',
          100: '#eee3d1',
          200: '#ddc8a9',
          300: '#c9a77b',
          400: '#a98052',
          500: '#80603b',
          600: '#6e5234',
          700: '#61472d',
          800: '#4d3926',
          900: '#3d2e20',
        },
        amber: {
          500: '#bd8d4e',
          600: '#a9783f',
        },
        ink: '#24211D',
        canvas: '#FBF8F2',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-sora)', 'sans-serif'],
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
};
