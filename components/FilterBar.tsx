"use client";

import { ChevronDown, RotateCcw } from "lucide-react";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  placeholder: string;
  options: FilterOption[];
  value: string;
  onChange: (val: string) => void;
}

interface FilterBarProps {
  filters: FilterConfig[];
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export default function FilterBar({ filters, totalCount, filteredCount, onReset }: FilterBarProps) {
  const isFiltered = filteredCount < totalCount;

  return (
    <div className="sticky top-16 z-40 bg-bg-surface border-b border-[rgba(200,150,42,0.10)] py-3 px-0">
      <div className="max-w-content mx-auto px-6">
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="relative min-w-[140px] flex-1 md:flex-none md:w-auto">
              <select
                className="filter-select pr-8"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
              >
                <option value="">{filter.placeholder}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-40 pointer-events-none"
              />
            </div>
          ))}

          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-cream-40 whitespace-nowrap">
              Showing <span className="text-cream-60">{filteredCount}</span> data point{filteredCount !== 1 ? "s" : ""}
            </span>
            {isFiltered && (
              <button
                onClick={onReset}
                className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors"
              >
                <RotateCcw size={11} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
