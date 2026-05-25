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
        bg: {
          primary: "#0B1120",
          surface: "#101829",
          elevated: "#141F33",
          input: "#0C1422",
        },
        gold: {
          DEFAULT: "#C8962A",
          hover: "#D4A73A",
        },
        cream: {
          DEFAULT: "#F0EBE1",
        },
        positive: "#4ADE80",
        negative: "#F87171",
      },
      fontFamily: {
        display: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-karla)", "sans-serif"],
      },
      maxWidth: {
        content: "1200px",
        reading: "680px",
        card: "600px",
      },
      borderColor: {
        gold: {
          DEFAULT: "rgba(200,150,42,0.12)",
          hover: "rgba(200,150,42,0.25)",
          active: "rgba(200,150,42,0.40)",
        },
      },
      backgroundImage: {
        "gold-muted": "rgba(200,150,42,0.06)",
      },
      animation: {
        "ekg-draw": "ekg-draw 2s linear infinite",
        "count-up": "count-up 1.5s ease-out forwards",
        pulse: "pulse 1.5s ease-in-out infinite",
      },
      keyframes: {
        "ekg-draw": {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
