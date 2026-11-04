/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fcfaf6',
          100: '#f7f2e7',
          200: '#f0e5cf',
          300: '#e5d3b0',
          DEFAULT: '#f7f2e7'
        },
        wood: {
          800: '#381e13',
          900: '#26140b',
          DEFAULT: '#4a2c1d',
          light: '#734c37'
        },
        cinnabar: {
          light: '#b83b32',
          DEFAULT: '#8b2622',
          dark: '#631815'
        },
        jade: {
          light: '#52b788',
          DEFAULT: '#2d6a4f',
          dark: '#1b4332'
        },
        gold: {
          light: '#f4a261',
          DEFAULT: '#d4af37',
          dark: '#b38f20'
        }
      },
      fontFamily: {
        oriental: ['"Noto Serif TC"', '"Songti SC"', 'SimSun', 'serif'],
        body: ['system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
