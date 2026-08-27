/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Claro brand tokens — single source of truth, no raw hex in components
        brand: {
          DEFAULT: '#DA291C',
          dark:    '#A01E13',
          muted:   '#FEF2F2',
        },
      },
      fontFamily: {
        // Atkinson Hyperlegible: designed for low-vision & dyslexia accessibility (ui-ux-pro-max recommendation)
        sans: [
          'Atkinson Hyperlegible',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
