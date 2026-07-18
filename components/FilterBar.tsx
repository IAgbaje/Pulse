"use client";

import { ChevronDown, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";

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
    <div className="sticky top-16 z-40 border-b border-gold bg-surface-base px-0 py-3">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="relative min-w-[calc(50%-0.25rem)] flex-1 sm:min-w-[140px] md:w-auto md:flex-none">
              <select
                className="filter-select pr-8"
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                aria-label={filter.placeholder}
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
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-content-tertiary"
              />
            </div>
          ))}

          <div className="ml-auto flex w-full items-center justify-between gap-3 pt-1 sm:w-auto sm:justify-end sm:pt-0">
            <span className="whitespace-nowrap text-xs text-content-tertiary">
              <span className="num text-content-secondary">{filteredCount}</span> shown
            </span>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-auto min-h-[36px] gap-1 px-1 py-2 text-content-accent hover:text-gold-300"
              >
                <RotateCcw size={11} aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
