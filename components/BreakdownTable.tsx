"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { formatCurrency, MIN_SEGMENT_RECORDS, type LevelBreakdown, type IndustryBreakdown } from "@/lib/data";

type Row = LevelBreakdown | IndustryBreakdown;

function isLevel(r: Row): r is LevelBreakdown {
  return "level" in r;
}

interface BreakdownTableProps {
  data: Row[];
  type: "level" | "industry";
  title: string;
}

type SortKey = "median" | "p25" | "p75" | "count";

/* Server already filters segments below MIN_SEGMENT_RECORDS (lib/data.ts);
   this is a client-side guard should that floor ever loosen. */
const SUPPRESSION_THRESHOLD = MIN_SEGMENT_RECORDS;

const COL_LABEL: Record<SortKey, string> = {
  median: "Median",
  p25: "25th",
  p75: "75th",
  count: "n",
};

export default function BreakdownTable({ data, type, title }: BreakdownTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("median");
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((p) => !p);
    else { setSortKey(key); setSortAsc(false); }
  };

  const sorted = [...data].sort((a, b) => {
    const diff = a[sortKey] - b[sortKey];
    return sortAsc ? diff : -diff;
  });

  const maxMedian = Math.max(1, ...data.map((r) => r.median));

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span aria-hidden="true" className="ml-1 inline-flex flex-col gap-0 opacity-50">
      <ChevronUp size={8} className={sortKey === col && sortAsc ? "text-gold opacity-100" : ""} />
      <ChevronDown size={8} className={sortKey === col && !sortAsc && sortKey === col ? "text-gold opacity-100" : ""} />
    </span>
  );

  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="border-b border-gold px-5 py-4">
        <p className="text-sm font-semibold text-content-primary">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="data-table w-full">
          <thead>
            <tr>
              <th>
                <span className="text-content-tertiary">{type === "level" ? "Level" : "Industry"}</span>
              </th>
              {(["median", "p25", "p75", "count"] as SortKey[]).map((col) => (
                <th key={col}>
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    aria-sort={sortKey === col ? (sortAsc ? "ascending" : "descending") : "none"}
                    className="inline-flex items-center bg-transparent p-0 text-content-tertiary transition-colors duration-fast ease-standard hover:text-content-secondary"
                  >
                    {COL_LABEL[col]}
                    <SortIcon col={col} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const label = isLevel(row) ? row.level.split(" (")[0] : row.industry;
              const suppressed = row.count < SUPPRESSION_THRESHOLD;
              const barPct = Math.max(4, (row.median / maxMedian) * 100);

              return (
                <tr key={i} className="even:bg-surface-raised">
                  <td className="text-content-secondary">
                    <span className="flex flex-col gap-1">
                      <span>{label}</span>
                      <span
                        aria-hidden="true"
                        className="h-1 rounded-full bg-gradient-to-r from-gold-600 to-gold-400"
                        style={{ width: `${barPct}%` }}
                      />
                    </span>
                  </td>
                  {suppressed ? (
                    <td colSpan={3} className="italic text-content-tertiary">
                      Too few records (n={row.count}) to show reliably
                    </td>
                  ) : (
                    <>
                      <td className="salary-cell">{formatCurrency(row.median)}</td>
                      <td className="num text-content-secondary">{formatCurrency(row.p25)}</td>
                      <td className="num text-content-secondary">{formatCurrency(row.p75)}</td>
                    </>
                  )}
                  <td className="num text-content-tertiary">{row.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
