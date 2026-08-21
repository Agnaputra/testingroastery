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
        // 52 Coffee Slowbar Design System Tokens (From Official PDF Menu)
        primary: "#223C5E",
        "primary-container": "#1B304B",
        "on-primary": "#ffffff",
        "on-primary-container": "#eaf0f8",
        "primary-fixed": "#d4e3f4",
        "primary-fixed-dim": "#a8c5e6",
        "surface-tint": "#2B4C77",
        "surface": "#ffffff",
        "background": "#f8fafd",
        "surface-white": "#FFFFFF",
        "surface-bright": "#f8fafd",
        "surface-dim": "#d9e2ec",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f5f9",
        "surface-container": "#eaf0f6",
        "surface-container-high": "#e2eaf2",
        "surface-container-highest": "#d6e2ee",
        "on-surface": "#1e293b",
        "on-surface-variant": "#475569",
        "on-secondary-container": "#334155",
        "on-secondary-fixed-variant": "#1e293b",
        "border-subtle": "#E2E8F0",
        "outline-variant": "#cbd5e1",
        "outline": "#64748b",
        "status-success": "#10B981",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f8fafc",
        "chat-bot-bg": "#1e293b",

        // Slowbar PDF Theme
        brand: {
          navy: "#223C5E",
          "navy-dark": "#162A43",
          "navy-light": "#31527D",
          teal: "#2698AB",
          "teal-light": "#54B6C5",
          "teal-dark": "#1A7382",
          maroon: "#8B1E2D",
          "maroon-light": "#A82C3D",
          pill: "#EAF0F6",
          "pill-hover": "#DCE6F1",
          border: "#E2E8F0",
        },

        // 52 Coffee Palette
        roastery: {
          dark: "#162A43",
          charcoal: "#1E293B",
          slate: "#223C5E",
          "slate-light": "#31527D",
          "slate-dark": "#162A43",
          crimson: "#8B1E2D",
          "crimson-light": "#A82C3D",
          "crimson-dark": "#63131F",
          teal: "#2698AB",
          "teal-light": "#54B6C5",
          amber: "#D97706",
          "amber-light": "#F59E0B",
          caramel: "#8B1E2D",
          cream: "#f8fafd",
          card: "#FFFFFF",
          sage: "#2698AB",
          muted: "#64748B",
          light: "#EAF0F6",
          border: "#E2E8F0",
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
