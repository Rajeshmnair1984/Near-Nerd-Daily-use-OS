/**
 * Design tokens for the Near Nerd Operations Portal.
 * These mirror the CSS custom properties in globals.css.
 * Use CSS variables (var(--*)) at runtime; these are for JS-only contexts.
 */
export const spacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "2rem",
  "2xl": "2.5rem",
  "3xl": "3rem",
} as const;

export const colors = {
  primary: "#0071e3",
  primaryHover: "#005bb8",
  success: "#2fb344",
  successBright: "#10b981",
  warning: "#b7791f",
  warningBright: "#f59e0b",
  error: "#d92d20",
  errorBright: "#ef4444",
  info: "#0b6bcb",
  infoBright: "#3b82f6",
  greenBright: "#34a853",
  orangeBright: "#ff9500",
  bgMain: "#f5f5f7",
  bgCard: "rgba(255, 255, 255, 0.84)",
  surface: "#ffffff",
  surfaceSoft: "#f9fafb",
  border: "rgba(0, 0, 0, 0.08)",
  textPrimary: "#1d1d1f",
  textSecondary: "#6e6e73",
} as const;

export const borderRadius = {
  sm: "8px",
  md: "12px",
  lg: "24px",
  xl: "32px",
  "2xl": "40px",
  pill: "100px",
} as const;

export const shadows = {
  sm: "0 4px 12px rgba(0, 0, 0, 0.03)",
  md: "0 12px 32px rgba(0, 0, 0, 0.08)",
  lg: "0 24px 60px rgba(0, 0, 0, 0.12)",
} as const;

export const transitions = {
  fast: "all 0.15s ease-in-out",
  normal: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
  slow: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export const typography = {
  h1: { fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, lineHeight: 1.05, letterSpacing: "-0.04em" },
  h2: { fontSize: "1.5rem", fontWeight: 900, lineHeight: 1.3, letterSpacing: "-0.02em" },
  h3: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 },
  body: { fontSize: "1rem", fontWeight: 400, lineHeight: 1.5 },
  small: { fontSize: "0.875rem", fontWeight: 400, lineHeight: 1.5 },
  xs: { fontSize: "0.75rem", fontWeight: 400, lineHeight: 1.5 },
} as const;

export const breakpoints = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
} as const;