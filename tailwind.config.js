/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#b71131',
          light: '#c73351',
          dark: '#8f0e27',
        },
        secondary: {
          DEFAULT: '#fdd00d',
          light: '#fed63d',
          dark: '#d1ac0b',
        },
        brand: {
          25: '#fef2f2',
          50: '#fde5e8',
          100: '#fcccd2',
          200: '#f9a2ac',
          300: '#f47585',
          400: '#e54d61',
          500: '#b71131',
          600: '#8f0e27',
          700: '#770b20',
          800: '#5f091a',
          900: '#4c0714',
        },
      },
    },
  },
  plugins: [],
};
