import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
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
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        /* Premium site template tokens (use with data-theme) */
        site: {
          background: "hsl(var(--site-background))",
          foreground: "hsl(var(--site-foreground))",
          card: "hsl(var(--site-card))",
          "card-foreground": "hsl(var(--site-card-foreground))",
          primary: "hsl(var(--site-primary))",
          "primary-foreground": "hsl(var(--site-primary-foreground))",
          accent: "hsl(var(--site-accent))",
          "accent-foreground": "hsl(var(--site-accent-foreground))",
          muted: "hsl(var(--site-muted))",
          "muted-foreground": "hsl(var(--site-muted-foreground))",
          border: "hsl(var(--site-border))",
          input: "hsl(var(--site-input))",
          ring: "hsl(var(--site-ring))",
          "hero-overlay": "hsl(var(--site-hero-overlay))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "site-radius": "var(--site-radius)",
      },
      spacing: {
        // 8px grid system
        "grid-1": "8px",
        "grid-2": "16px",
        "grid-3": "24px",
        "grid-4": "32px",
        "grid-5": "40px",
        "grid-6": "48px",
        "grid-8": "64px",
        "grid-10": "80px",
        "grid-12": "96px",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "site-sm": "var(--site-shadow-sm)",
        "site": "var(--site-shadow)",
        "site-md": "var(--site-shadow-md)",
        "site-lg": "var(--site-shadow-lg)",
        "site-xl": "var(--site-shadow-xl)",
        "site-2xl": "var(--site-shadow-2xl)",
        "site-glow": "var(--site-shadow-glow)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
