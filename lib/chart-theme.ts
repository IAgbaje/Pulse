import type { CSSProperties } from "react";

/**
 * Shared Recharts theme — Pulse viz token palette.
 *
 * Recharts renders SVG attributes directly, so CSS var() strings work for
 * `fill` / `stroke` / `stopColor` etc. in all modern browsers. Never
 * hardcode a hex or rgb-alpha literal in chart components — reference
 * tokens through these exports (or var(--token) directly) instead.
 *
 * Palette rules (docs/Pulse Design System Brief/guidelines/viz-palette.html):
 * - VIZ_COLORS is used IN ORDER starting at index 0 (gold, --viz-1). Never
 *   reassign hues per chart — index 0 is always gold, index 1 always
 *   vermilion, etc.
 * - Single-hue sequential/ordered-magnitude data (e.g. salary by seniority
 *   level) uses GOLD_RAMP, not the categorical VIZ_COLORS set.
 * - Semantic deltas (positive/negative) use --success-400 / --danger-400,
 *   never a viz hue.
 */

/** Categorical palette, colorblind-safe (Okabe-Ito derived). Use in order. */
export const VIZ_COLORS: readonly string[] = [
  "var(--viz-1)", // gold
  "var(--viz-2)", // vermilion
  "var(--viz-3)", // teal
  "var(--viz-4)", // blue
  "var(--viz-5)", // purple
  "var(--viz-6)", // pink
  "var(--viz-7)", // green
  "var(--viz-8)", // slate
];

/** Sequential single-hue ramp (light -> dark) for ordered/magnitude series. */
export const GOLD_RAMP: readonly string[] = [
  "var(--gold-200)",
  "var(--gold-300)",
  "var(--gold-400)",
  "var(--gold-500)",
  "var(--gold-600)",
];

/**
 * Pick a GOLD_RAMP step proportionally for `index` of `total` ordered
 * items, so sequential bars/cells fade from --gold-200 to --gold-600
 * instead of interpolating a raw opacity value.
 */
export function sequentialGold(index: number, total: number): string {
  if (total <= 1) return GOLD_RAMP[GOLD_RAMP.length - 1];
  const step = Math.round((index / (total - 1)) * (GOLD_RAMP.length - 1));
  return GOLD_RAMP[step];
}

export interface AxisTickStyle {
  fontSize: number;
  fill: string;
  fontFamily: string;
}

/** Axis tick label style — 12px, --text-tertiary, per viz-palette guidelines. */
export const axisTickStyle: AxisTickStyle = {
  fontSize: 12,
  fill: "var(--text-tertiary)",
  fontFamily: "var(--font-body)",
};

/** Cartesian gridline stroke, for charts that render <CartesianGrid>. */
export const gridStroke = "var(--border-subtle)";

/**
 * Custom-tooltip container style: surface-raised card with a strong
 * border, medium radius, and elevation-2 shadow — the shared tooltip
 * recipe every chart's <Tooltip content={...}> should render onto.
 */
export const tooltipContentStyle: CSSProperties = {
  background: "var(--surface-raised)",
  border: "1px solid var(--border-strong)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-2)",
  padding: "var(--space-3)",
  fontFamily: "var(--font-body)",
};

/** Bar/area hover-cursor fill for Recharts <Tooltip cursor={...}>. */
export const tooltipCursorStyle: { fill: string } = {
  fill: "var(--accent-fill-tint)",
};

/** Reference-line (median/percentile marker) style, per Histogram.jsx recipe. */
export const referenceLineStyle: { stroke: string; labelFill: string } = {
  stroke: "var(--gold-400)",
  labelFill: "var(--gold-400)",
};
