"use client";

import type { BenefitStat } from "@/lib/data";

interface BenefitsChartProps {
  data: BenefitStat[];
  totalRecords: number;
}

export default function BenefitsChart({ data, totalRecords }: BenefitsChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-content-tertiary text-sm">
      Not enough data for this view.
    </div>
  );

  const maxCount = data[0].count;

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.benefit}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-content-secondary">{item.benefit}</span>
            <span className="text-xs text-content-tertiary tabular-nums">
              {item.percent}% <span className="text-content-tertiary">({item.count})</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-gold overflow-hidden">
            <div
              className="h-full rounded-full bg-gold-500 transition-all duration-slow ease-decel"
              style={{ width: `${(item.count / maxCount) * 100}%`, opacity: 0.4 + (item.count / maxCount) * 0.6 }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-content-tertiary pt-2">
        Based on {totalRecords} submissions. Respondents may list multiple benefits.
      </p>
    </div>
  );
}
