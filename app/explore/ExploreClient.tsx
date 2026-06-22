"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import {
  formatCurrency,
  LATEST_YEAR,
  MIN_SEGMENT_RECORDS,
  type Aggregates,
  type LevelBreakdown,
  type IndustryBreakdown,
  type SalaryBucket,
  type CompensationRecord,
} from "@/lib/data";
import FilterBar from "@/components/FilterBar";
import StatCard from "@/components/StatCard";
import DistributionChart from "@/components/DistributionChart";
import BreakdownTable from "@/components/BreakdownTable";
import RecentSubmissions from "@/components/RecentSubmissions";

interface ExploreData {
  aggregate: Aggregates;
  byLevel: LevelBreakdown[];
  byIndustry: IndustryBreakdown[];
  buckets: SalaryBucket[];
  recent: CompensationRecord[];
}

interface ExploreClientProps {
  totalCount: number;
  filterOptions: {
    levels: string[];
    industries: string[];
    locations: string[];
    stages: string[];
    companies: string[];
    years: number[];
  };
  initial: ExploreData;
}

const DEFAULT_YEAR = String(LATEST_YEAR);

const yearLabel = (y: number) =>
  y === LATEST_YEAR ? `${y} dataset (current)` : `${y} dataset (historical)`;

export default function ExploreClient({ totalCount, filterOptions, initial }: ExploreClientProps) {
  const [year, setYear] = useState(DEFAULT_YEAR);
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [stage, setStage] = useState("");
  const [company, setCompany] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [data, setData] = useState<ExploreData>(initial);
  const [loading, setLoading] = useState(false);
  const isInitial = useRef(true);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const filters = useMemo(
    () => ({
      year: year ? Number(year) : undefined,
      level: level || undefined,
      industry: industry || undefined,
      location: location || undefined,
      stage: stage || undefined,
      company: company || undefined,
      search: search || undefined,
    }),
    [year, level, industry, location, stage, company, search]
  );

  useEffect(() => {
    // Skip the first run. The server-rendered default state is already correct.
    if (isInitial.current) { isInitial.current = false; return; }
    let cancelled = false;
    setLoading(true);
    fetch("/api/aggregates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    })
      .then((r) => r.json())
      .then((res: ExploreData) => {
        if (!cancelled) {
          setData(res);
          const activeFilters = Object.entries(filters).filter(([, v]) => v !== undefined).map(([k]) => k);
          if (activeFilters.length > 1 || (activeFilters.length === 1 && activeFilters[0] !== "year")) {
            track("explore_filtered", {
              filters: activeFilters.join(","),
              result_count: res.aggregate.count,
              ...(filters.search ? { search_query: filters.search } : {}),
            });
          }
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters]);

  const reset = useCallback(() => {
    setYear(DEFAULT_YEAR); setLevel(""); setIndustry(""); setLocation(""); setStage(""); setCompany(""); setSearch(""); setSearchInput("");
  }, []);

  const filterConfigs = [
    { key: "year", placeholder: "All years (pooled)", value: year, onChange: setYear, options: [...filterOptions.years].sort((a, b) => b - a).map((y) => ({ value: String(y), label: yearLabel(y) })) },
    { key: "level", placeholder: "All levels", value: level, onChange: setLevel, options: filterOptions.levels.map((l) => ({ value: l, label: l.split(" (")[0] })) },
    { key: "industry", placeholder: "All industries", value: industry, onChange: setIndustry, options: filterOptions.industries.map((i) => ({ value: i, label: i })) },
    { key: "location", placeholder: "All locations", value: location, onChange: setLocation, options: filterOptions.locations.map((l) => ({ value: l, label: l })) },
    { key: "stage", placeholder: "All stages", value: stage, onChange: setStage, options: filterOptions.stages.map((s) => ({ value: s, label: s })) },
    ...(filterOptions.companies.length > 0 ? [{ key: "company", placeholder: "All companies", value: company, onChange: setCompany, options: filterOptions.companies.map((c) => ({ value: c, label: c })) }] : []),
  ];

  const { aggregate: agg, byLevel, byIndustry, buckets, recent } = data;

  return (
    <>
      <div className="pt-16">
        <FilterBar
          filters={filterConfigs}
          totalCount={totalCount}
          filteredCount={agg.count}
          onReset={reset}
        />
      </div>

      <div className="max-w-content mx-auto px-6 py-10 space-y-10">

        <div>
          <h1 className="text-2xl font-semibold text-cream">Salary explorer</h1>
          <p className="text-sm text-cream-60 mt-1">
            Search by company, role, or function. Use filters to narrow results.
          </p>
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search roles, companies, or functions... e.g. &quot;Product Manager&quot; or &quot;Fintech&quot;"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-bg-primary border border-[rgba(200,150,42,0.25)] rounded-lg px-4 py-2.5 text-cream text-sm outline-none focus:border-gold placeholder:text-cream-40 transition-colors"
            />
          </div>
          {year === "" && (
            <p className="text-xs text-gold/80 mt-1">
              Viewing all years pooled. 2023 and {LATEST_YEAR} salaries come from very different
              economic conditions, so treat pooled statistics with caution.
            </p>
          )}
          {agg.countWithGross < agg.count && (
            <p className="text-xs text-cream-40 mt-1">
              ₦ statistics from {agg.countWithGross} NGN records with gross data · {agg.count - agg.countWithGross} additional records (net-only or diaspora) shown in the table.
            </p>
          )}
          {loading && <p className="text-xs text-cream-40 mt-1">Updating…</p>}
        </div>

        {agg.countWithGross < MIN_SEGMENT_RECORDS ? (
          <div className="surface-card text-center py-10">
            <p className="text-cream font-semibold mb-2">Not enough data for this filter</p>
            <p className="text-sm text-cream-60 mb-4">
              {agg.countWithGross} NGN record{agg.countWithGross !== 1 ? "s" : ""} with gross salary found. We need at least {MIN_SEGMENT_RECORDS} for reliable stats.
            </p>
            <button onClick={reset} className="text-gold text-sm hover:underline">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Median Gross" value={formatCurrency(agg.median)} subtitle="Monthly gross salary" />
            <StatCard label="25th Percentile" value={formatCurrency(agg.p25)} subtitle="Lower quartile" />
            <StatCard label="75th Percentile" value={formatCurrency(agg.p75)} subtitle="Upper quartile" />
            <StatCard label="Data Points" value={agg.count} subtitle="In current filter" />
          </div>
        )}

        {agg.countWithGross >= MIN_SEGMENT_RECORDS && (
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Salary distribution</p>
            <p className="text-xs text-cream-40 mb-4">Monthly gross (₦ NGN records only)</p>
            <DistributionChart aggregate={agg} buckets={buckets} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BreakdownTable data={byLevel} type="level" title="By level" />
          <BreakdownTable data={byIndustry} type="industry" title="By industry" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-cream mb-1">Latest contributions</h2>
          <p className="text-sm text-cream-60 mb-4">
            The most recent anonymized submissions to the index. Details that could identify a
            single respondent are suppressed.
          </p>
          <RecentSubmissions data={recent} />
        </div>
      </div>
    </>
  );
}
