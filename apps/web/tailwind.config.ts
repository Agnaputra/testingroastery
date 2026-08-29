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
        // 52 Coffee Official Brand Guidelines Palette (from Canva)
        primary: "#465C70", // Deep Steel Blue
        "primary-container": "#2C3136", // Charcoal
        "on-primary": "#ffffff",
        "on-primary-container": "#CFE8EA", // Light Mist
        "primary-fixed": "#CFE8EA",
        "primary-fixed-dim": "#8FB9BC", // Soft Teal
        "surface-tint": "#465C70",
        "surface": "#ffffff",
        "background": "#F8FAFC",
        "surface-white": "#FFFFFF",
        "surface-bright": "#F8FAFC",
        "surface-dim": "#DDE7EB",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F0F5F7",
        "surface-container": "#E3ECF0",
        "surface-container-high": "#D3E0E6",
        "surface-container-highest": "#C2D3DC",
        "on-surface": "#2C3136", // Charcoal
        "on-surface-variant": "#617281", // Slate Blue Gray
        "on-secondary-container": "#2C3136",
        "on-secondary-fixed-variant": "#465C70",
        "border-subtle": "#DCE6EB",
        "outline-variant": "#CBD8DF",
        "outline": "#617281",
        "status-success": "#10B981",
        "inverse-surface": "#2C3136",
        "inverse-on-surface": "#F8FAFC",
        "chat-bot-bg": "#2C3136",

        // Official Canva Brand Tokens
        brand: {
          navy: "#465C70", // Deep Steel Blue (Primary)
          "navy-dark": "#2C3136", // Charcoal
          "navy-light": "#617281", // Slate Blue Gray
          teal: "#8FB9BC", // Soft Teal (Primary Accent)
          "teal-light": "#CFE8EA", // Light Mist
          "teal-dark": "#465C70", // Deep Steel Blue
          maroon: "#A52136", // Crimson Roast
          "maroon-dark": "#5D1823", // Dark Maroon Roast
          "maroon-light": "#C4334C",
          charcoal: "#2C3136",
          slate: "#617281",
          mist: "#CFE8EA",
          pill: "#F0F5F7",
          "pill-hover": "#E3ECF0",
          border: "#DCE6EB",
        },

        // Roastery Named Palette
        roastery: {
          dark: "#2C3136",
          charcoal: "#2C3136",
          slate: "#465C70",
          "slate-light": "#617281",
          "slate-dark": "#2C3136",
          crimson: "#A52136",
          "crimson-light": "#C4334C",
          "crimson-dark": "#5D1823",
          teal: "#8FB9BC",
          "teal-light": "#CFE8EA",
          amber: "#D97706",
          "amber-light": "#F59E0B",
          caramel: "#A52136",
          cream: "#F8FAFC",
          card: "#FFFFFF",
          sage: "#8FB9BC",
          muted: "#617281",
          light: "#F0F5F7",
          border: "#DCE6EB",
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
        sans: ["Montserrat", "Plus Jakarta Sans", "sans-serif"],
        headline: ["Raleway", "sans-serif"],
        editorial: ["Raleway", "sans-serif"],
        serif: ["Raleway", "serif"],
        mono: ["Cascadia Code", "JetBrains Mono", "monospace"],
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
        "marquee": "marquee 35s linear infinite",
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
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
