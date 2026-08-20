import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma 52 Coffee Design System Tokens
        primary: "#b70011",
        "primary-container": "#dc2626",
        "on-primary": "#ffffff",
        "on-primary-container": "#fff6f5",
        "primary-fixed": "#ffdad6",
        "primary-fixed-dim": "#ffb4ab",
        "surface-tint": "#bf0715",
        "surface": "#f8f9ff",
        "background": "#f8f9ff",
        "surface-white": "#FFFFFF",
        "surface-bright": "#f8f9ff",
        "surface-dim": "#d1dbec",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f6fa",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dfe9fa",
        "surface-container-highest": "#d9e3f4",
        "on-surface": "#121c28",
        "on-surface-variant": "#5c403c",
        "on-secondary-container": "#5c6274",
        "on-secondary-fixed-variant": "#404758",
        "border-subtle": "#E5E7EB",
        "outline-variant": "#e6bdb8",
        "outline": "#916f6b",
        "status-success": "#10B981",
        "inverse-surface": "#27313e",
        "inverse-on-surface": "#eaf1ff",
        "chat-bot-bg": "#111827",

        // 52 Coffee Palette
        roastery: {
          dark: "#0F1419",
          charcoal: "#1B242D",
          slate: "#2E4252",
          "slate-light": "#455E73",
          "slate-dark": "#1A2834",
          crimson: "#b70011",
          "crimson-light": "#dc2626",
          "crimson-dark": "#7f000c",
          teal: "#10B981",
          "teal-light": "#34D399",
          amber: "#D97706",
          "amber-light": "#F59E0B",
          caramel: "#b70011",
          cream: "#f8f9ff",
          card: "#FFFFFF",
          sage: "#4A6E6B",
          muted: "#5c6274",
          light: "#f4f6fa",
          border: "#E5E7EB",
        },
      },
      spacing: {
        gutter: "24px",
        "container-max": "1280px",
        "margin-desktop": "40px",
        "section-gap": "80px",
        "margin-mobile": "16px",
        "component-gap": "16px",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "Plus Jakarta Sans", "Inter", "sans-serif"],
        editorial: ["Hanken Grotesk", "Playfair Display", "serif"],
        serif: ["Hanken Grotesk", "Playfair Display", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "800" }],
        "display-lg": ["48px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.2", fontWeight: "600" }],
      },
      boxShadow: {
        editorial: "0 10px 30px -10px rgba(28, 19, 14, 0.08)",
        "editorial-hover": "0 20px 40px -15px rgba(28, 19, 14, 0.15)",
        floating: "0 12px 36px rgba(28, 19, 14, 0.18)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
