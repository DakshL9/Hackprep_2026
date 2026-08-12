import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        rose: {
          50: "#fff1f2",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
        },
        indigo: {
          500: "#6366f1",
          600: "#4f46e5",
        }
      },
    },
  },
  plugins: [],
};
export default config;
