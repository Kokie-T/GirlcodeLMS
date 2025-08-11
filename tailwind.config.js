/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',  // <---- add this line!
  
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
