/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14171C',
        paper: '#F6F5F1',
        line: '#DBD8CF',
        ballot: {
          DEFAULT: '#B3261E',
          dark: '#8E1E18',
        },
        brass: {
          DEFAULT: '#A6812E',
          light: '#C9A96A',
        },
      },
      fontFamily: {
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
