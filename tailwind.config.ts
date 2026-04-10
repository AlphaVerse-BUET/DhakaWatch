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
        // Primary colors from swapnil's palette
        teal: {
          DEFAULT: "#06d6a0",
          50: "#ecfdf8",
          100: "#d1faf0",
          200: "#a7f3e1",
          300: "#6ee7c7",
          400: "#34d4a8",
          500: "#06d6a0",
          600: "#05a87d",
          700: "#058566",
          800: "#066951",
          900: "#055643",
        },
        blue: {
          DEFAULT: "#118ab2",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#b9e5fe",
          300: "#7cd1fd",
          400: "#36b9fa",
          500: "#118ab2",
          600: "#0369a1",
          700: "#0c4a6e",
          800: "#134e6f",
          900: "#14365d",
        },
        purple: {
          DEFAULT: "#7b2ff7",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#7b2ff7",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b0d73",
        },
        red: {
          DEFAULT: "#ef476f",
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fed0d6",
          300: "#fca5b5",
          400: "#f87192",
          500: "#ef476f",
          600: "#dc2651",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        yellow: {
          DEFAULT: "#ffd166",
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#ffd166",
          500: "#eab308",
          600: "#ca8a04",
          700: "#a16207",
          800: "#854d0e",
          900: "#713f12",
        },
        // Background colors
        navy: {
          DEFAULT: "#0a0e1a",
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#0f172a",
          900: "#0a0e1a",
          950: "#060b18",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary":
          "linear-gradient(135deg, #06d6a0 0%, #118ab2 50%, #7b2ff7 100%)",
      },
      animation: {
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        "marker-pulse": "markerPulse 3s ease-in-out infinite",
        "slide-in": "slideIn 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(6, 214, 160, 0.6)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow: "0 0 40px rgba(6, 214, 160, 0.8)",
          },
        },
        markerPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.15)", opacity: "0.4" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
  // Safelist for dynamically constructed class names (template literals prevent JIT detection)
  safelist: [
    // Monitoring module colors (red, yellow, orange)
    "bg-red-500/5", "bg-red-500/10", "bg-red-500/20", "text-red-400", "from-red-500/5", "border-red-500/30",
    "bg-yellow-500/5", "bg-yellow-500/10", "bg-yellow-500/20", "text-yellow-400", "from-yellow-500/5", "border-yellow-500/30",
    "bg-orange-500/5", "bg-orange-500/10", "bg-orange-500/20", "text-orange-400", "from-orange-500/5", "border-orange-500/30",
    // Analysis metric button colors
    "bg-purple-500/20", "text-purple-400", "border-purple-500/30",
    "bg-teal-500/20", "text-teal-400", "border-teal-500/30",
    "bg-green-500/20", "text-green-400", "border-green-500/30",
    // Group-hover variants for module cards
    "group-hover:bg-red-500/20", "group-hover:bg-yellow-500/20", "group-hover:bg-orange-500/20",
  ],
};

export default config;
