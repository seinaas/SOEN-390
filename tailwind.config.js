/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#099474',
          200: '#088467',
          300: '#07745b',
          400: '#06644e',
          500: '#055442',
          600: '#044435',
          700: '#033428',
          800: '#02241c',
          900: '#01140f',
        },
      },
    },
  },
  plugins: [],
};
