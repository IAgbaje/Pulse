// SERVER-ONLY. Do not import this file from any client component.
//
// This is the only place that touches the raw dataset (data/seed.json,
// data/community_2024.json) and Supabase approved submissions. Everything else
// (homepage, API routes, server-rendered insight cards) consumes the dataset
// through `getAllData()` here and emits aggregates/coarsened rows to the client.
// Gender, company_name, and any other sensitive field stays on this side of the
// boundary.

import "server-only";
import seedData from "@/data/seed.json";
import community2024Data from "@/data/community_2024.json";
import { createClient } from "@supabase/supabase-js";
import type { CompensationRecord } from "@/lib/data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function toCompensationRecord(row: Record<string, unknown>): CompensationRecord {
  return {
    id: row.id as string,
    source: "community_2024",
    source_label: "Community 2024",
    function: row.function as string,
    role_level: row.role_level as string,
    job_title: (row.job_title as string) ?? null,
    years_experience: (row.years_experience as string) ?? null,
    gender: (row.gender as string) ?? null,
    age_range: (row.age_range as string) ?? null,
    satisfaction: (row.satisfaction as number) ?? null,
    education: (row.education as string) ?? null,
    location: (row.location as string) ?? null,
    work_arrangement: (row.work_arrangement as string) ?? null,
    currency: row.currency as string,
    monthly_gross: (row.monthly_gross as number) ?? null,
    monthly_net: (row.monthly_net as number) ?? null,
    company_name: (row.company_name as string) ?? null,
    foreign_employer: (row.foreign_employer as boolean) ?? null,
    industry: (row.industry as string) ?? null,
    company_stage: (row.company_stage as string) ?? null,
    company_size: (row.company_size as string) ?? null,
    company_age: (row.company_age as string) ?? null,
    headquartered_in_nigeria: (row.headquartered_in_nigeria as boolean) ?? null,
    company_hq: (row.company_hq as string) ?? null,
    team_size: (row.team_size as string) ?? null,
    manage_others: (row.manage_others as boolean) ?? null,
    report_to: (row.report_to as string) ?? null,
    negotiated: (row.negotiated as string) ?? null,
    negotiation_outcome: (row.negotiation_outcome as string) ?? null,
    has_bonus: (row.has_bonus as boolean) ?? null,
    bonus_range: (row.bonus_range as string) ?? null,
    has_equity: (row.has_equity as boolean) ?? null,
    benefits: Array.isArray(row.benefits)
      ? (row.benefits as string[]).join(", ")
      : ((row.benefits as string) ?? null),
    confirmed_currency: (row.confirmed_currency as string) ?? null,
    multi_currency: (row.multi_currency as boolean) ?? null,
    year: row.year as number,
    submission_date: (row.submission_date as string) ?? null,
  };
}

export async function getAllData(): Promise<CompensationRecord[]> {
  const historical: CompensationRecord[] = [
    ...(seedData as CompensationRecord[]),
    ...(community2024Data as CompensationRecord[]),
  ];

  if (!supabase) return historical;

  try {
    const { data: approved } = await supabase
      .from("approved_submissions")
      .select("*");
    if (!approved) return historical;
    return [...historical, ...approved.map(toCompensationRecord)];
  } catch {
    return historical;
  }
}
