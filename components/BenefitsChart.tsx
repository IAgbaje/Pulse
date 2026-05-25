"use client";

import type { BenefitStat } from "@/lib/data";

interface BenefitsChartProps {
  data: BenefitStat[];
  totalRecords: number;
}

export default function BenefitsChart({ data, totalRecords }: BenefitsChartProps) {
  if (!data.length) return (
    <div className="flex items-center justify-center h-48 text-cream-40 text-sm">
      Not enough data for this view.
    </div>
  );

  const maxCount = data[0].count;

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.benefit}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-cream-60">{item.benefit}</span>
            <span className="text-xs text-cream-40 tabular-nums">
              {item.percent}% <span className="text-cream-30">({item.count})</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[rgba(200,150,42,0.08)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gold transition-all duration-500"
              style={{ width: `${(item.count / maxCount) * 100}%`, opacity: 0.4 + (item.count / maxCount) * 0.6 }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-cream-30 pt-2">
        Based on {totalRecords} submissions. Respondents may list multiple benefits.
      </p>
    </div>
  );
}
