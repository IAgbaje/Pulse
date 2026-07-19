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
  const belowP25 = userValue < p25;

  return (
    <div
      className="space-y-3"
      role="group"
      aria-label={`You are at the ${percentileRank}th percentile: ${formatCurrency(userValue)} against a median of ${formatCurrency(median)}`}
    >
      {/* Bar */}
      <div className="relative h-3 overflow-visible rounded-full bg-gradient-to-r from-content-secondary/10 to-gold-500/25">
        {/* IQR fill */}
        <div
          className="absolute h-full rounded-full bg-gold-500/25"
          style={{ left: `${p25Pct}%`, width: `${p75Pct - p25Pct}%` }}
          aria-hidden="true"
        />
        {/* Median tick */}
        <div
          className="absolute top-1/2 h-5 w-0.5 -translate-y-1/2 rounded bg-gold-400/60"
          style={{ left: `${medianPct}%` }}
          aria-hidden="true"
        />
        {/* User marker */}
        <div
          className="absolute top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${userPct}%` }}
          aria-hidden="true"
        >
          <div className="h-4 w-4 rounded-full border-2 border-surface-canvas bg-gold-400 shadow-lg shadow-gold/30" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between text-xs text-content-tertiary">
        <div>
          <span className="num block text-content-secondary">{formatCurrency(p25)}</span>
          <span>25th</span>
        </div>
        <div className="text-center">
          <span className="num block text-content-secondary">{formatCurrency(median)}</span>
          <span>Median</span>
        </div>
        <div className="text-right">
          <span className="num block text-content-secondary">{formatCurrency(p75)}</span>
          <span>75th</span>
        </div>
      </div>

      {/* Rank badge */}
      <div className="mt-4 text-center">
        <span className={["display num text-display-lg", belowP25 ? "text-warning-bright" : "text-content-accent"].join(" ")}>
          {percentileRank}th
        </span>
        <span className="mt-1 block text-sm text-content-secondary">percentile</span>
      </div>
    </div>
  );
}
