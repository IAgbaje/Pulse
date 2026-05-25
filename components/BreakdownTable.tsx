"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { formatCurrency, type LevelBreakdown, type IndustryBreakdown } from "@/lib/data";

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

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 inline-flex flex-col gap-0 opacity-50">
      <ChevronUp size={8} className={sortKey === col && sortAsc ? "opacity-100 text-gold" : ""} />
      <ChevronDown size={8} className={sortKey === col && !sortAsc && sortKey === col ? "opacity-100 text-gold" : ""} />
    </span>
  );

  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="px-5 py-4 border-b border-[rgba(200,150,42,0.08)]">
        <p className="text-sm font-semibold text-cream">{title}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>{type === "level" ? "Level" : "Industry"}</th>
              {(["median", "p25", "p75", "count"] as SortKey[]).map((col) => (
                <th
                  key={col}
                  className="cursor-pointer hover:text-cream-60 transition-colors"
                  onClick={() => handleSort(col)}
                >
                  {col === "median" ? "Median" : col === "p25" ? "25th" : col === "p75" ? "75th" : "n"}
                  <SortIcon col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i}>
                <td className="text-cream-60">
                  {isLevel(row) ? row.level.split(" (")[0] : row.industry}
                </td>
                <td className="salary-cell">{formatCurrency(row.median)}</td>
                <td className="text-cream-60">{formatCurrency(row.p25)}</td>
                <td className="text-cream-60">{formatCurrency(row.p75)}</td>
                <td className="text-cream-40">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
