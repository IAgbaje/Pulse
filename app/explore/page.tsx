import type { Metadata } from "next";
import { getAllData } from "@/lib/server-data";
import {
  getAggregates,
  getByLevel,
  getByIndustry,
  getSalaryBuckets,
  getRecentSubmissions,
  getFilterOptions,
  coarsenForDisplay,
  filterData,
  LATEST_YEAR,
} from "@/lib/data";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Salary Explorer | Pulse",
  description:
    "Filter anonymous Nigerian tech salary data by year, level, industry, location, and company stage.",
};

export default async function ExplorePage() {
  // Pre-compute the default view (2026 dataset, no filters) on the server so
  // the page renders with real data before any API call.
  const all = await getAllData();
  const initialFilters = { year: LATEST_YEAR };
  const filtered = filterData(all, initialFilters);
  const opts = getFilterOptions(all);
  const recent = coarsenForDisplay(getRecentSubmissions(filtered, 20), all).map((r) => ({
    id: r.id,
    source: r.source,
    source_label: r.source_label,
    function: r.function,
    role_level: r.role_level,
    location: r.location,
    work_arrangement: r.work_arrangement,
    industry: r.industry,
    company_stage: r.company_stage,
    company_size: r.company_size,
    currency: r.currency,
    monthly_gross: r.monthly_gross,
    monthly_net: r.monthly_net,
    company_name: r.company_name ?? null,
    negotiated: r.negotiated,
    benefits: r.benefits,
    year: r.year,
    submission_date: r.submission_date,
  }));

  return (
    <ExploreClient
      totalCount={all.length}
      filterOptions={{
        levels: opts.levels,
        industries: opts.industries,
        locations: opts.locations,
        stages: opts.stages.filter((s): s is string => Boolean(s)),
        companies: opts.companies.filter((c): c is string => Boolean(c)),
        years: opts.years,
      }}
      initial={{
        aggregate: getAggregates(filtered),
        byLevel: getByLevel(filtered),
        byIndustry: getByIndustry(filtered),
        buckets: getSalaryBuckets(filtered),
        recent,
      }}
    />
  );
}
