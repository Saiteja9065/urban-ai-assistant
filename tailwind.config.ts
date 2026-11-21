import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aqi: {
          good: "#10b981",
          moderate: "#f59e0b",
          poor: "#f97316",
          unhealthy: "#ef4444",
          severe: "#8b5cf6",
          hazardous: "#7f1d1d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
