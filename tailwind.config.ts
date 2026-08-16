import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        process: {
          bg: "#0f111e",
          panel: "#191b2c",
          line: "#2e3148",
          muted: "#8f96a8",
          cyan: "#00f0ff",
          orange: "#f97316",
          red: "#ef4444",
          green: "#10b981",
          yellow: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
        kpi: "12px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(0, 240, 255, 0.12)",
      },
    },
  },
  plugins: [],
} satisfies Config;
