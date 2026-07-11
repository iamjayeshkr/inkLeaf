import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0D12",
          50: "#F4F5F7",
          100: "#E4E6EA",
          200: "#C3C7D1",
          300: "#8B92A3",
          400: "#5A6274",
          500: "#3A4152",
          600: "#242A38",
          700: "#181D28",
          800: "#11151E",
          900: "#0B0D12",
        },
        paper: {
          DEFAULT: "#FBF8F1",
          dim: "#F3EEE2",
          line: "#E6DFCC",
        },
        signal: {
          DEFAULT: "#3D5AFE",
          soft: "#7B8CFF",
          dim: "#1E2A99",
        },
        gold: {
          DEFAULT: "#C9A227",
          soft: "#E0C158",
        },
      },
      fontFamily: {
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        serif: ["var(--font-serif)", "Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "ui-sans-serif", "sans-serif"],
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(11,13,18,0.035) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "18px 18px",
      },
      keyframes: {
        "caret-blink": {
          "0%, 45%": { opacity: "1" },
          "50%, 95%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ink-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        caret: "caret-blink 1s steps(1) infinite",
        "ink-in": "ink-in 0.35s ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
