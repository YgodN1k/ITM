import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070707",
        panel: "#111111",
        muted: "#1f1f1f",
        accent: "#ffa900",
        copy: "#f5f5f5",
        soft: "rgba(255,255,255,0.7)"
      },
      boxShadow: {
        frame: "inset 0 0 0 1px rgba(255, 169, 0, 0.85)",
        glow: "0 24px 80px rgba(255, 169, 0, 0.18)"
      },
      borderRadius: {
        xl2: "2rem",
        xl3: "3rem"
      }
    },
  },
  plugins: [],
};

export default config;
