// Static filter dropdown values + record count. Cached at the edge: the
// dataset only changes on rebuild, so this never needs to be recomputed at
// request time.

import { NextResponse } from "next/server";
import { getAllData } from "@/lib/server-data";
import { getFilterOptions } from "@/lib/data";

export const dynamic = "force-static";

export async function GET() {
  const data = getAllData();
  const opts = getFilterOptions(data);
  return NextResponse.json({
    totalCount: data.length,
    levels: opts.levels,
    industries: opts.industries,
    locations: opts.locations,
    stages: opts.stages,
    years: opts.years,
    sources: opts.sources,
  });
}
