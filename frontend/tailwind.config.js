/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark : "#131313",
        white : "#FFFF",
        brown: '#4E3322',
        background: "#F7F4F2",
        primary: "#FFFF",
        primarySecond: "#F7F4F2",
        secondary: "#30E0A1",
        tertiary: "#E8DDD9",
        chatItem: "#736B66",
      },
    },
  },
  plugins: [],
};
