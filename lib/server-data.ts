// SERVER-ONLY. Do not import this file from any client component.
//
// This is the only place that touches the raw dataset (data/seed.json,
// data/community_2024.json). Everything else (homepage, API routes,
// server-rendered insight cards) consumes the dataset through `getAllData()`
// here and emits aggregates/coarsened rows to the client. Gender and any other
// sensitive field stays on this side of the boundary.

import "server-only";
import seedData from "@/data/seed.json";
import community2024Data from "@/data/community_2024.json";
import type { CompensationRecord } from "@/lib/data";

export function getAllData(): CompensationRecord[] {
  return [
    ...(seedData as CompensationRecord[]),
    ...(community2024Data as CompensationRecord[]),
  ];
}
