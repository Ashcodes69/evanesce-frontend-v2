import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", 
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          glow: "var(--primary-glow)",
        },
        text: {
          main: "var(--text-main)",
          muted: "var(--text-muted)",
        },
        border: "var(--border)",
        destructive: "var(--destructive)",
      },
    },
  },
  plugins: [],
};
export default config;