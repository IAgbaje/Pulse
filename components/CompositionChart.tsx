"use client";

// Composition chart — a small donut/bar combo for "who's in the dataset"
// breakdowns (function, level, year, location, currency). Sized for
// screenshotting into Twitter/LinkedIn posts at 1:1 or 2:1 aspect.

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface CompositionSlice {
  label: string;
  count: number;
}

// Gold gradient across slices, with the largest slice in the brand gold and
// the rest fading to lower-opacity tints. Stable order = stable color.
const SLICE_COLORS = [
  "#C8962A",
  "rgba(200,150,42,0.65)",
  "rgba(200,150,42,0.50)",
  "rgba(200,150,42,0.38)",
  "rgba(200,150,42,0.28)",
  "rgba(200,150,42,0.20)",
  "rgba(200,150,42,0.14)",
  "rgba(200,150,42,0.10)",
];

interface TooltipPayload { name: string; value: number; payload: { label: string; count: number; pct: number } }
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-surface border border-[rgba(200,150,42,0.20)] rounded-lg p-3 text-xs">
      <p className="text-cream font-semibold">{d.label}</p>
      <p className="text-gold mt-1">{d.count} record{d.count !== 1 ? "s" : ""} · {d.pct}%</p>
    </div>
  );
};

interface CompositionChartProps {
  data: CompositionSlice[];
  /** Optional short title shown above the donut. */
  title?: string;
  /** Optional subtitle/caption shown above the donut. */
  caption?: string;
}

export default function CompositionChart({ data, title, caption }: CompositionChartProps) {
  const total = data.reduce((sum, s) => sum + s.count, 0);
  if (total === 0) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      No data yet.
    </div>
  );
  // Sort largest-first so the brand-gold slice anchors the chart consistently.
  const sorted = [...data].sort((a, b) => b.count - a.count);
  const enriched = sorted.map((s) => ({ ...s, pct: Math.round((s.count / total) * 100) }));

  return (
    <div>
      {title && <p className="text-sm font-semibold text-cream mb-1">{title}</p>}
      {caption && <p className="text-xs text-cream-40 mb-4">{caption}</p>}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-[55%] h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={enriched}
                dataKey="count"
                nameKey="label"
                innerRadius="55%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="none"
              >
                {enriched.map((_, i) => (
                  <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="w-full sm:w-[45%] space-y-1.5 text-xs">
          {enriched.map((s, i) => (
            <li key={s.label} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
              />
              <span className="text-cream-60 flex-1 truncate" title={s.label}>{s.label}</span>
              <span className="text-cream-40 tabular-nums whitespace-nowrap">
                {s.pct}% <span className="text-cream-30">({s.count})</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
