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
import { axisTickStyle, tooltipContentStyle, tooltipCursorStyle, sequentialGold } from "@/lib/chart-theme";

interface SalaryChartProps {
  data: LevelBreakdown[];
}

interface TooltipPayload { payload: LevelBreakdown & { label: string } }
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

export default function SalaryChart({ data }: SalaryChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-content-tertiary text-sm">
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
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          width={72}
        />
        <Tooltip content={<CustomTooltip />} cursor={tooltipCursorStyle} />
        <Bar dataKey="median" radius={[0, 4, 4, 0]} barSize={20}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={sequentialGold(i, chartData.length)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
