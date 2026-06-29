import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: "#101216",
        panel: "#181b21",
        panelSoft: "#20242c",
        line: "#303641",
        ink: "#f4f7fb",
        muted: "#9aa4b2",
        accent: "#6aa5ff",
        good: "#5bd39c",
        caution: "#f4bf68"
      },
      boxShadow: {
        subtle: "0 12px 40px rgba(0, 0, 0, 0.26)"
      }
    }
  },
  plugins: []
};

export default config;
