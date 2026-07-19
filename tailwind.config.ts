import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* --- semantic surfaces --- */
        surface: {
          canvas: "var(--surface-canvas)",
          base: "var(--surface-base)",
          raised: "var(--surface-raised)",
          sunken: "var(--surface-sunken)",
          gold: "var(--surface-gold)",
        },
        /* --- semantic text (use as text-*) --- */
        content: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)", // A1 amended 0.50 — minimum for informational content
          hint: "var(--text-hint)", // decorative/disabled only (2.42:1) — never informational
          accent: "var(--text-accent)",
          "on-gold": "var(--text-on-gold)",
        },
        /* --- accent / brand --- */
        gold: {
          50: "var(--gold-50)", 100: "var(--gold-100)", 200: "var(--gold-200)",
          300: "var(--gold-300)", 400: "var(--gold-400)", 500: "var(--gold-500)",
          600: "var(--gold-600)", 700: "var(--gold-700)", 800: "var(--gold-800)",
          900: "var(--gold-900)",
          DEFAULT: "var(--gold-500)",
        },
        navy: {
          50: "var(--navy-50)", 100: "var(--navy-100)", 200: "var(--navy-200)",
          300: "var(--navy-300)", 400: "var(--navy-400)", 500: "var(--navy-500)",
          600: "var(--navy-600)", 700: "var(--navy-700)", 800: "var(--navy-800)",
          850: "var(--navy-850)", 900: "var(--navy-900)", 950: "var(--navy-950)",
        },
        cream: {
          50: "var(--cream-50)", 100: "var(--cream-100)", 200: "var(--cream-200)",
          300: "var(--cream-300)", 400: "var(--cream-400)", 500: "var(--cream-500)",
          600: "var(--cream-600)", 700: "var(--cream-700)", 800: "var(--cream-800)",
          900: "var(--cream-900)",
        },
        /* --- harmonized semantics --- */
        success: { DEFAULT: "var(--success-500)", bright: "var(--success-400)", bg: "var(--success-bg)" },
        warning: { DEFAULT: "var(--warning-500)", bright: "var(--warning-400)", bg: "var(--warning-bg)" },
        danger: { DEFAULT: "var(--danger-500)", bright: "var(--danger-400)", bg: "var(--danger-bg)" },
        info: { DEFAULT: "var(--info-500)", bright: "var(--info-400)", bg: "var(--info-bg)" },
        /* --- categorical data-viz (gold is viz-1) --- */
        viz: {
          1: "var(--viz-1)", 2: "var(--viz-2)", 3: "var(--viz-3)", 4: "var(--viz-4)",
          5: "var(--viz-5)", 6: "var(--viz-6)", 7: "var(--viz-7)", 8: "var(--viz-8)",
        },
      },
      /* semantic border colors (use as border-*) */
      borderColor: {
        subtle: "var(--border-subtle)",
        DEFAULT: "var(--border-default)",
        strong: "var(--border-strong)",
        gold: "var(--border-gold)",
        "gold-hover": "var(--border-gold-hover)",
        "gold-active": "var(--border-gold-active)",
        focus: "var(--border-focus)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      /* Bebas display steps + Karla body steps → [size, {lineHeight, letterSpacing, fontWeight}] */
      fontSize: {
        "display-2xl": ["var(--display-2xl)", { lineHeight: "var(--display-line)", letterSpacing: "var(--display-tracking)", fontWeight: "400" }],
        "display-xl": ["var(--display-xl)", { lineHeight: "var(--display-line)", letterSpacing: "var(--display-tracking)", fontWeight: "400" }],
        "display-lg": ["var(--display-lg)", { lineHeight: "var(--display-line)", letterSpacing: "var(--display-tracking)", fontWeight: "400" }],
        "display-md": ["var(--display-md)", { lineHeight: "var(--display-line)", letterSpacing: "var(--display-tracking)", fontWeight: "400" }],
        "display-sm": ["var(--display-sm)", { lineHeight: "var(--display-line)", letterSpacing: "var(--display-tracking)", fontWeight: "400" }],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--line-tight)" }],
        xl: ["var(--text-xl)", { lineHeight: "var(--line-snug)" }],
        lg: ["var(--text-lg)", { lineHeight: "var(--line-normal)" }],
        md: ["var(--text-md)", { lineHeight: "var(--line-normal)" }],
        sm: ["var(--text-sm)", { lineHeight: "var(--line-normal)" }],
        xs: ["var(--text-xs)", { lineHeight: "var(--line-snug)" }],
      },
      letterSpacing: {
        caps: "var(--tracking-caps)",
        wide: "var(--tracking-wide)",
        tight: "var(--tracking-tight)",
        display: "var(--display-tracking)",
      },
      lineHeight: {
        tight: "var(--line-tight)", snug: "var(--line-snug)",
        normal: "var(--line-normal)", relaxed: "var(--line-relaxed)",
        display: "var(--display-line)",
      },
      /* 4px spacing scale (extends Tailwind's; keys match tokens.css) */
      spacing: {
        "1": "var(--space-1)", "2": "var(--space-2)", "3": "var(--space-3)",
        "4": "var(--space-4)", "5": "var(--space-5)", "6": "var(--space-6)",
        "8": "var(--space-8)", "10": "var(--space-10)", "12": "var(--space-12)",
        "16": "var(--space-16)", "20": "var(--space-20)", "24": "var(--space-24)",
      },
      maxWidth: {
        content: "var(--container-max)",
        read: "var(--container-read)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
        focus: "var(--focus-ring)",
      },
      backgroundColor: {
        scrim: "var(--scrim)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        decel: "var(--ease-decel)",
        accel: "var(--ease-accel)",
        emphasis: "var(--ease-emphasis)",
        ekg: "var(--ease-ekg)",
      },
      transitionDuration: {
        instant: "80ms",
        fast: "140ms",
        base: "220ms",
        slow: "360ms",
        count: "900ms",
        ekg: "1600ms",
      },
      keyframes: {
        "ekg-draw": { from: { strokeDashoffset: "1", opacity: "1" }, to: { strokeDashoffset: "0", opacity: "1" } },
        "ekg-breathe": { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
        "count-reveal": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "skeleton-shimmer": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(100%)" } },
        "page-enter": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "btn-spin": { to: { transform: "rotate(360deg)" } },
        "toast-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "toast-out": { from: { opacity: "1", transform: "translateY(0)" }, to: { opacity: "0", transform: "translateY(-6px)" } },
        "modal-in": { from: { opacity: "0", transform: "translate(-50%, -46%) scale(0.98)" }, to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" } },
        "sheet-in": { from: { transform: "translateY(100%)" }, to: { transform: "translateY(0)" } },
        "new-pulse": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      animation: {
        "ekg-draw": "ekg-draw 1600ms var(--ease-ekg) forwards",
        "ekg-breathe": "ekg-breathe 3.2s var(--ease-standard) 1600ms infinite",
        "count-reveal": "count-reveal 220ms var(--ease-decel) both",
        skeleton: "skeleton-shimmer 1.4s var(--ease-standard) infinite",
        "page-enter": "page-enter 360ms var(--ease-decel) both",
        "btn-spin": "btn-spin 800ms linear infinite",
        "toast-in": "toast-in 220ms var(--ease-decel) both",
        "toast-out": "toast-out 220ms var(--ease-accel) both",
        "modal-in": "modal-in 360ms var(--ease-decel) both",
        "sheet-in": "sheet-in 360ms var(--ease-decel) both",
        "new-pulse": "new-pulse 2s var(--ease-standard) infinite",
      },
      screens: {
        sm: "640px", md: "768px", lg: "1024px", xl: "1280px",
      },
    },
  },
  plugins: [],
};

export default config;
