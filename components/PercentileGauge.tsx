"use client";

import { formatCurrency } from "@/lib/data";

interface PercentileGaugeProps {
  p25: number;
  median: number;
  p75: number;
  userValue: number;
  percentileRank: number;
}

export default function PercentileGauge({ p25, median, p75, userValue, percentileRank }: PercentileGaugeProps) {
  const min = p25 * 0.6;
  const max = p75 * 1.4;
  const range = max - min;

  const toPercent = (val: number) => Math.max(0, Math.min(100, ((val - min) / range) * 100));

  const p25Pct = toPercent(p25);
  const medianPct = toPercent(median);
  const p75Pct = toPercent(p75);
  const userPct = toPercent(userValue);

  return (
    <div className="space-y-3">
      {/* Bar */}
      <div className="relative h-3 rounded-full bg-[rgba(200,150,42,0.08)] overflow-visible">
        {/* IQR fill */}
        <div
          className="absolute h-full rounded-full bg-[rgba(200,150,42,0.20)]"
          style={{ left: `${p25Pct}%`, width: `${p75Pct - p25Pct}%` }}
        />
        {/* Median tick */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gold/60 rounded"
          style={{ left: `${medianPct}%` }}
        />
        {/* User marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0 h-0 -translate-x-1/2"
          style={{ left: `${userPct}%` }}
        >
          <div className="w-4 h-4 rounded-full bg-gold border-2 border-bg-primary shadow-lg shadow-gold/30" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-cream-40">
        <div>
          <span className="block text-cream-60">{formatCurrency(p25)}</span>
          <span>25th</span>
        </div>
        <div className="text-center">
          <span className="block text-cream-60">{formatCurrency(median)}</span>
          <span>Median</span>
        </div>
        <div className="text-right">
          <span className="block text-cream-60">{formatCurrency(p75)}</span>
          <span>75th</span>
        </div>
      </div>

      {/* Rank badge */}
      <div className="text-center mt-4">
        <span className="font-display text-5xl text-gold">{percentileRank}th</span>
        <span className="block text-sm text-cream-60 mt-1">percentile</span>
      </div>
    </div>
  );
}
