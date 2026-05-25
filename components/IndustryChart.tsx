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

interface IndustryChartProps {
  data: IndustryBreakdown[];
}

interface TooltipPayload { payload: IndustryBreakdown }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-surface border border-[rgba(200,150,42,0.20)] rounded-lg p-3 text-xs">
      <p className="text-cream font-semibold mb-1">{label}</p>
      <p className="text-gold">Median: {formatCurrency(d.median)}</p>
      <p className="text-cream-60">25th: {formatCurrency(d.p25)}</p>
      <p className="text-cream-60">75th: {formatCurrency(d.p75)}</p>
      <p className="text-cream-40 mt-1">n = {d.count}</p>
    </div>
  );
};

export default function IndustryChart({ data }: IndustryChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      Not enough data for this view.
    </div>
  );

  const top = data.slice(0, 6);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top} margin={{ left: 8, right: 8, top: 4, bottom: 24 }}>
        <XAxis
          dataKey="industry"
          tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }}
          axisLine={false}
          tickLine={false}
          angle={-25}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200,150,42,0.06)" }} />
        <Bar dataKey="median" radius={[4, 4, 0, 0]} barSize={28}>
          {top.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "#C8962A" : "rgba(200,150,42,0.40)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
