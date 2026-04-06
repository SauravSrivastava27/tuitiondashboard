/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'nb-yellow': '#FFE600',
        'nb-pink': '#FF4D6D',
        'nb-blue': '#4CC9F0',
        'nb-green': '#80ED99',
        'nb-black': '#000000',
        'nb-white': '#FFFFFF',
      },
      boxShadow: {
        'nb': '6px 6px 0px 0px rgba(0,0,0,1)',
        'nb-sm': '4px 4px 0px 0px rgba(0,0,0,1)',
        'nb-lg': '8px 8px 0px 0px rgba(0,0,0,1)',
      },
      borderWidth: {
        '3': '3px',
        '5': '5px',
      },
    },
  },
  plugins: [],
}
