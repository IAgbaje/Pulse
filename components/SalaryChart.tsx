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
import { formatCurrency, getLevelShortLabel, type LevelBreakdown } from "@/lib/data";

interface SalaryChartProps {
  data: LevelBreakdown[];
}

interface TooltipPayload { payload: LevelBreakdown & { label: string } }
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

export default function SalaryChart({ data }: SalaryChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      Not enough data for this view.
    </div>
  );

  const chartData = data.map((d) => ({
    ...d,
    label: getLevelShortLabel(d.level),
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <XAxis
          type="number"
          tickFormatter={(v) => formatCurrency(v)}
          tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 12, fill: "rgba(240,235,225,0.60)" }}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200,150,42,0.06)" }} />
        <Bar dataKey="median" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={i === 0 ? "rgba(200,150,42,0.35)" : i === chartData.length - 1 ? "#C8962A" : `rgba(200,150,42,${0.35 + (i / (chartData.length - 1)) * 0.65})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
