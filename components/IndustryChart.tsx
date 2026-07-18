"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency, type IndustryBreakdown } from "@/lib/data";
import { VIZ_COLORS, axisTickStyle, tooltipContentStyle, tooltipCursorStyle } from "@/lib/chart-theme";

interface IndustryChartProps {
  data: IndustryBreakdown[];
}

interface TooltipPayload { payload: IndustryBreakdown }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="text-xs" style={tooltipContentStyle}>
      <p className="text-content-primary font-semibold mb-1">{label}</p>
      <p className="text-gold">Median: {formatCurrency(d.median)}</p>
      <p className="text-content-secondary">25th: {formatCurrency(d.p25)}</p>
      <p className="text-content-secondary">75th: {formatCurrency(d.p75)}</p>
      <p className="text-content-tertiary mt-1">n = {d.count}</p>
    </div>
  );
};

export default function IndustryChart({ data }: IndustryChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-content-tertiary text-sm">
      Not enough data for this view.
    </div>
  );

  const top = data.slice(0, 6);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top} margin={{ left: 8, right: 8, top: 4, bottom: 24 }}>
        <XAxis
          dataKey="industry"
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          angle={-25}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} cursor={tooltipCursorStyle} />
        <Bar dataKey="median" radius={[4, 4, 0, 0]} barSize={28}>
          {top.map((_, i) => (
            <Cell key={i} fill={VIZ_COLORS[0]} fillOpacity={i === 0 ? 1 : 0.4} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
