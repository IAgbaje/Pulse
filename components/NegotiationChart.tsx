"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  formatCurrency,
  getLevelShortLabel,
  getMedian,
  type CompensationRecord,
  LEVEL_ORDER,
  MIN_SEGMENT_RECORDS,
} from "@/lib/data";

interface NegotiationChartProps {
  data: CompensationRecord[];
}

interface TooltipEntry { dataKey: string; name: string; fill: string; value: number }
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-surface border border-[rgba(200,150,42,0.20)] rounded-lg p-3 text-xs">
      <p className="text-cream font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.fill }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function NegotiationChart({ data }: NegotiationChartProps) {
  const chartData = LEVEL_ORDER.slice(0, 4).map((level) => {
    const levelData = data.filter(
      (r) => r.role_level === level && r.currency === "NGN" && r.monthly_gross !== null
    );
    const negotiated = levelData
      .filter((r) => r.negotiated === "Yes" || r.negotiated === "Sort of")
      .map((r) => r.monthly_gross as number);
    const notNeg = levelData
      .filter((r) => r.negotiated === "No")
      .map((r) => r.monthly_gross as number);
    return {
      level: getLevelShortLabel(level),
      Negotiated: getMedian(negotiated),
      "Not negotiated": getMedian(notNeg),
      // Only show a level when both groups clear the minimum-records threshold —
      // a median of two salaries is a coincidence, not a benchmark.
      valid: negotiated.length >= MIN_SEGMENT_RECORDS && notNeg.length >= MIN_SEGMENT_RECORDS,
    };
  }).filter((d) => d.valid);

  if (!chartData.length) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      Not enough data for this view.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 4, bottom: 4 }}>
        <XAxis dataKey="level" tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }} axisLine={false} tickLine={false} width={60} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200,150,42,0.06)" }} />
        <Legend wrapperStyle={{ fontSize: 11, color: "rgba(240,235,225,0.50)" }} />
        <Bar dataKey="Negotiated" fill="#C8962A" radius={[4, 4, 0, 0]} barSize={16} />
        <Bar dataKey="Not negotiated" fill="rgba(200,150,42,0.30)" radius={[4, 4, 0, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
