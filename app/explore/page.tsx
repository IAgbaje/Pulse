"use client";

import { useState, useMemo } from "react";
import {
  getAllData,
  filterData,
  getAggregates,
  getByLevel,
  getByIndustry,
  getSalaryBuckets,
  getRecentSubmissions,
  getFilterOptions,
  formatCurrency,
} from "@/lib/data";
import FilterBar from "@/components/FilterBar";
import StatCard from "@/components/StatCard";
import DistributionChart from "@/components/DistributionChart";
import BreakdownTable from "@/components/BreakdownTable";
import RecentSubmissions from "@/components/RecentSubmissions";

const allData = getAllData();
const filterOpts = getFilterOptions(allData);


const SOURCE_LABELS: Record<string, string> = {
  community_2023: "Community 2023",
  community_2024: "Community 2024",
  pulse_2026: "Pulse 2026",
};

export default function ExplorePage() {
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");

  const filtered = useMemo(
    () => filterData(allData, {
      level: level || undefined,
      industry: industry || undefined,
      location: location || undefined,
      stage: stage || undefined,
      source: source || undefined,
    }),
    [level, industry, location, stage, source]
  );
  const agg = useMemo(() => getAggregates(filtered), [filtered]);
  const byLevel = useMemo(() => getByLevel(filtered), [filtered]);
  const byIndustry = useMemo(() => getByIndustry(filtered), [filtered]);
  const buckets = useMemo(() => getSalaryBuckets(filtered), [filtered]);
  const recent = useMemo(() => getRecentSubmissions(filtered, 20), [filtered]);

  const reset = () => { setLevel(""); setIndustry(""); setLocation(""); setStage(""); setSource(""); };

  const filterConfigs = [
    { key: "level", placeholder: "All levels", value: level, onChange: setLevel, options: filterOpts.levels.map((l) => ({ value: l, label: l.split(" (")[0] })) },
    { key: "industry", placeholder: "All industries", value: industry, onChange: setIndustry, options: filterOpts.industries.map((i) => ({ value: i, label: i })) },
    { key: "location", placeholder: "All locations", value: location, onChange: setLocation, options: filterOpts.locations.map((l) => ({ value: l, label: l })) },
    { key: "stage", placeholder: "All stages", value: stage, onChange: setStage, options: filterOpts.stages.filter(Boolean).map((s) => ({ value: s!, label: s! })) },
    { key: "source", placeholder: "All time", value: source, onChange: setSource, options: filterOpts.sources.map((s) => ({ value: s, label: SOURCE_LABELS[s] ?? s })) },
  ];

  return (
    <>
      <div className="pt-16">
        <FilterBar
          filters={filterConfigs}
          totalCount={allData.length}
          filteredCount={filtered.length}
          onReset={reset}
        />
      </div>

      <div className="max-w-content mx-auto px-6 py-10 space-y-10">

        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-semibold text-cream">Salary explorer</h1>
          <p className="text-sm text-cream-60 mt-1">
            Filter by level, industry, location, stage, or dataset to explore compensation data.
          </p>
          {agg.countWithGross < agg.count && (
            <p className="text-xs text-cream-40 mt-1">
              ₦ statistics from {agg.countWithGross} NGN records with gross data · {agg.count - agg.countWithGross} additional records (net-only or diaspora) shown in the table.
            </p>
          )}
        </div>

        {/* Aggregate cards */}
        {agg.countWithGross < 5 ? (
          <div className="surface-card text-center py-10">
            <p className="text-cream font-semibold mb-2">Not enough data for this filter</p>
            <p className="text-sm text-cream-60 mb-4">
              {agg.countWithGross} NGN record{agg.countWithGross !== 1 ? "s" : ""} with gross salary found. We need at least 5 for reliable stats.
            </p>
            <button onClick={reset} className="text-gold text-sm hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Median Gross" value={formatCurrency(agg.median)} subtitle="Monthly gross salary" />
            <StatCard label="25th Percentile" value={formatCurrency(agg.p25)} subtitle="Lower quartile" />
            <StatCard label="75th Percentile" value={formatCurrency(agg.p75)} subtitle="Upper quartile" />
            <StatCard label="Data Points" value={agg.count} subtitle="In current filter" />
          </div>
        )}

        {/* Distribution chart */}
        {agg.countWithGross >= 5 && (
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Salary distribution</p>
            <p className="text-xs text-cream-40 mb-4">Monthly gross (₦ NGN records only)</p>
            <DistributionChart data={filtered} buckets={buckets} />
          </div>
        )}

        {/* Breakdown tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BreakdownTable data={byLevel} type="level" title="By level" />
          <BreakdownTable data={byIndustry} type="industry" title="By industry" />
        </div>

        {/* Recent submissions */}
        <div>
          <h2 className="text-lg font-semibold text-cream mb-1">Latest contributions</h2>
          <p className="text-sm text-cream-60 mb-4">
            The most recent anonymized submissions to the index.
          </p>
          <RecentSubmissions data={recent} />
        </div>
      </div>
    </>
  );
}
