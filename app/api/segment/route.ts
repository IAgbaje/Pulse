// Compare page benchmarking endpoint. Returns only percentile anchors and a
// count — no raw salary values, no record metadata. The client interpolates
// the user's percentile rank from the anchors so the salary number itself
// never leaves the browser.

import { NextRequest, NextResponse } from "next/server";
import { getAllData } from "@/lib/server-data";
import {
  filterData,
  getGrossValues,
  getMedian,
  getPercentile,
  LATEST_YEAR,
  type Filters,
} from "@/lib/data";

export async function POST(req: NextRequest) {
  let body: { level?: string; industry?: string; currency?: string; includeHistorical?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const filters: Filters = {
    level: body.level,
    industry: body.industry,
    year: body.includeHistorical ? undefined : LATEST_YEAR,
  };

  const segment = filterData(getAllData(), filters);
  const currency = body.currency ?? "NGN";
  const values = getGrossValues(segment, currency);

  if (values.length === 0) {
    return NextResponse.json({ count: 0, anchors: null });
  }

  return NextResponse.json({
    count: values.length,
    anchors: {
      p10: getPercentile(values, 10),
      p25: getPercentile(values, 25),
      p50: getMedian(values),
      p75: getPercentile(values, 75),
      p90: getPercentile(values, 90),
    },
  });
}
