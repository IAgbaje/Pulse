// Explore page filter endpoint. Accepts a filter spec and returns aggregates,
// breakdowns, distribution buckets, and coarsened recent rows. Never raw
// records with gender or other sensitive fields.

import { NextRequest, NextResponse } from "next/server";
import { getAllData } from "@/lib/server-data";
import {
  filterData,
  getAggregates,
  getByLevel,
  getByIndustry,
  getSalaryBuckets,
  getRecentSubmissions,
  coarsenForDisplay,
  type Filters,
  type CompensationRecord,
} from "@/lib/data";

// Strip server-only fields before returning a record to the client.
function toDisplayRow(r: CompensationRecord) {
  return {
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
    negotiated: r.negotiated,
    benefits: r.benefits,
    year: r.year,
    submission_date: r.submission_date,
  };
}

export async function POST(req: NextRequest) {
  let body: Filters & { recentLimit?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const filters: Filters = {
    year: body.year,
    level: body.level,
    industry: body.industry,
    location: body.location,
    stage: body.stage,
    source: body.source,
  };

  const all = getAllData();
  const filtered = filterData(all, filters);
  const recentLimit = Math.min(Math.max(body.recentLimit ?? 20, 1), 50);
  const recentRaw = getRecentSubmissions(filtered, recentLimit);
  const recent = coarsenForDisplay(recentRaw, all).map(toDisplayRow);

  return NextResponse.json({
    aggregate: getAggregates(filtered),
    byLevel: getByLevel(filtered),
    byIndustry: getByIndustry(filtered),
    buckets: getSalaryBuckets(filtered),
    recent,
  });
}
