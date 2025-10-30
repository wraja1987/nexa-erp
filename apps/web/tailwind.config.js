/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  safelist: [
    "bg-gradient-to-br",
    "from-[#2E3B8F]",
    "via-[#4C3BCF]",
    "to-[#6A4DFF]",
  ],
  plugins: [],
};
