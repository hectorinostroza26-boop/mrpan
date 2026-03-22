/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bakery: {
          50: '#fdf8ec',
          100: '#f9eed2',
          200: '#f2dba5',
          300: '#e9c370',
          400: '#e0a542',
          500: '#d48825',
          600: '#ba6b1b',
          700: '#9b5219',
          800: '#7f421a',
          900: '#693819',
          950: '#3a1c0b',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
