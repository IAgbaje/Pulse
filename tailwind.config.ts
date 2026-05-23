import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "pulse-bg": "#081C0F",
        "pulse-gold": "#C8962A",
        "pulse-cream": "#F0EBE1",
        "pulse-tooltip": "#0A2614",
      },
      fontFamily: {
        bebas: ["var(--font-bebas)"],
        karla: ["var(--font-karla)"],
      },
    },
  },
  plugins: [],
};
export default config;
