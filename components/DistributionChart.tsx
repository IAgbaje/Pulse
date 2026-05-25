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
import { type SalaryBucket, formatCurrency, getMedian, getNGNRecordsWithGross, type CompensationRecord } from "@/lib/data";

interface DistributionChartProps {
  data: CompensationRecord[];
  buckets: SalaryBucket[];
}

interface TooltipPayload { payload: { range: string; count: number } }
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-surface border border-[rgba(200,150,42,0.20)] rounded-lg p-3 text-xs">
      <p className="text-cream font-semibold">{d.range}</p>
      <p className="text-cream-60 mt-1">{d.count} submission{d.count !== 1 ? "s" : ""}</p>
    </div>
  );
};

export default function DistributionChart({ data, buckets }: DistributionChartProps) {
  const grossValues = getNGNRecordsWithGross(data);
  const median = getMedian(grossValues);

  if (!buckets.length) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      Not enough data for this view.
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={buckets} margin={{ left: 8, right: 16, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#C8962A" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#C8962A" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="range"
          tick={{ fontSize: 10, fill: "rgba(240,235,225,0.35)" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: "rgba(240,235,225,0.35)" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        {median > 0 && (
          <ReferenceLine
            x={buckets.find((b) => median >= b.min && median < b.max)?.range}
            stroke="#C8962A"
            strokeDasharray="4 3"
            label={{
              value: `Median: ${formatCurrency(median)}`,
              fill: "#C8962A",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
        )}
        <Area
          type="monotone"
          dataKey="count"
          stroke="#C8962A"
          strokeWidth={2}
          fill="url(#goldGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
