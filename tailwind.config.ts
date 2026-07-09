import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#FF6B35",
          hover: "#E55A28",
          light: "#FF8C5E",
        },
        navy: {
          DEFAULT: "#0F1624",
          light: "#1A2332",
          border: "#2D3748",
        },
        success: "#22C55E",
        warning: "#FBBF24",
        danger: "#EF4444",
        "secondary-text": "#9CA3AF",
        "white-text": "#F9FAFB",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        heading: ["Poppins", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "shimmer": { "100%": { transform: "translateX(100%)" } },
        "pulse-ring": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } },
        "slide-in": { "0%": { transform: "translateX(100%)", opacity: "0" }, "100%": { transform: "translateX(0)", opacity: "1" } },
        "scale-bounce": { "0%": { transform: "scale(0.9)" }, "50%": { transform: "scale(1.05)" }, "100%": { transform: "scale(1)" } },
      },
      animation: {
        "shimmer": "shimmer 2s infinite",
        "pulse-ring": "pulse-ring 2s ease-in-out infinite",
        "slide-in": "slide-in 0.2s ease-out",
        "scale-bounce": "scale-bounce 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
