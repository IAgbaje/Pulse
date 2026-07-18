"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { type SalaryBucket, type Aggregates, formatCurrency } from "@/lib/data";
import { VIZ_COLORS, axisTickStyle, tooltipContentStyle, referenceLineStyle } from "@/lib/chart-theme";

interface DistributionChartProps {
  aggregate: Aggregates;
  buckets: SalaryBucket[];
}

interface TooltipPayload { payload: { range: string; count: number } }
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="text-xs" style={tooltipContentStyle}>
      <p className="text-content-primary font-semibold">{d.range}</p>
      <p className="text-content-secondary mt-1">{d.count} submission{d.count !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default function DistributionChart({ aggregate, buckets }: DistributionChartProps) {
  const median = aggregate.median;

  if (!buckets.length) return (
    <div className="flex items-center justify-center h-48 text-content-tertiary text-sm">
      Not enough data for this view.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={buckets} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={VIZ_COLORS[0]} stopOpacity={0.25} />
            <stop offset="95%" stopColor={VIZ_COLORS[0]} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="range"
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={axisTickStyle}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        {median > 0 && (
          <ReferenceLine
            x={buckets.find((b) => median >= b.min && median < b.max)?.range}
            stroke={referenceLineStyle.stroke}
            strokeDasharray="4 3"
            label={{
              value: `Median: ${formatCurrency(median)}`,
              fill: referenceLineStyle.labelFill,
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="count"
          stroke={VIZ_COLORS[0]}
          strokeWidth={2}
          fill="url(#goldGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
