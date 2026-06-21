import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { submissionSchema } from "@/lib/form-schema";
import crypto from "crypto";

const ALLOWED_ORIGINS = [
  "https://getpulse.ng",
  "https://www.getpulse.ng",
  "https://pulse-kohl-one.vercel.app",
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : "",
].filter(Boolean);

const RATE_LIMIT_DAYS = 7;

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured");
  return createClient(url, key);
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "default-dev-salt";
  const monthKey = new Date().toISOString().slice(0, 7);
  return crypto.createHash("sha256").update(`${salt}:${monthKey}:${ip}`).digest("hex");
}

function buildSimilarityHash(data: {
  function: string;
  role_level: string;
  location: string;
  monthly_gross: number;
}): string {
  const grossBucket = Math.floor(data.monthly_gross / 100000) * 100000;
  const raw = `${data.function}|${data.role_level}|${data.location}|${grossBucket}`;
  return crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export async function POST(req: NextRequest) {
  // CSRF check
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot check
  if (typeof body === "object" && body !== null && "_honeypot" in body) {
    const hp = (body as Record<string, unknown>)._honeypot;
    if (typeof hp === "string" && hp.length > 0) {
      return NextResponse.json({ success: true, id: "ok" }, { status: 201 });
    }
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstError.message, field: firstError.path.join(".") },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const supabase = getSupabaseAdmin();

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = hashIp(ip);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RATE_LIMIT_DAYS);

  const { data: recentSubmissions } = await supabase
    .from("submission_rate_limits")
    .select("submitted_at")
    .eq("ip_hash", ipHash)
    .gte("submitted_at", cutoff.toISOString())
    .limit(1);

  if (recentSubmissions && recentSubmissions.length > 0) {
    const lastSubmit = new Date(recentSubmissions[0].submitted_at);
    const retryAfter = new Date(lastSubmit.getTime() + RATE_LIMIT_DAYS * 86400000);
    const daysLeft = Math.ceil((retryAfter.getTime() - Date.now()) / 86400000);
    return NextResponse.json(
      { error: "rate_limited", retry_after_days: daysLeft },
      { status: 429 },
    );
  }

  // Build submission row
  const isCompanyPath = data._path === "company";
  const similarityHash = buildSimilarityHash(data);

  // Check for duplicate flag (similarity hash match in last 90 days)
  const dupCutoff = new Date();
  dupCutoff.setDate(dupCutoff.getDate() - 90);
  const { data: similar } = await supabase
    .from("submissions")
    .select("id")
    .eq("similarity_hash", similarityHash)
    .gte("submission_date", dupCutoff.toISOString())
    .limit(1);

  const duplicateFlag = (similar && similar.length > 0) || false;

  const row: Record<string, unknown> = {
    company_path: isCompanyPath,
    monthly_gross: data.monthly_gross,
    monthly_net: data.monthly_net ?? null,
    currency: data.currency,
    function: data.function,
    job_title: data.job_title,
    role_level: data.role_level,
    years_experience: data.years_experience,
    location: data.location,
    location_state: data.location_state ?? null,
    location_country: data.location_country ?? null,
    work_arrangement: data.work_arrangement,
    gender: data.gender,
    age_range: data.age_range,
    satisfaction: data.satisfaction,
    confirmed_currency: data.confirmed_currency ?? null,
    multi_currency: data.multi_currency ?? null,
    benefits: data.benefits ?? null,
    ip_hash: ipHash,
    similarity_hash: similarityHash,
    duplicate_flag: duplicateFlag,
  };

  if (isCompanyPath) {
    const cd = data as Extract<typeof data, { _path: "company" }>;
    row.company_name = cd.company_name;
    row.company_name_raw = cd.company_name;
    row.education = cd.education ?? null;
    row.negotiated = cd.negotiated ?? null;
    row.negotiation_result = cd.negotiation_result ?? null;
    row.has_equity = cd.has_equity ?? null;
    row.has_bonus = cd.has_bonus ?? null;
  } else {
    const ad = data as Extract<typeof data, { _path: "anonymous" }>;
    row.foreign_employer = ad.foreign_employer;
    row.industry = ad.industry;
    row.education = ad.education;
    row.company_stage = ad.company_stage ?? null;
    row.company_size = ad.company_size ?? null;
    row.company_age = ad.company_age ?? null;
    row.headquartered_in_nigeria = ad.headquartered_in_nigeria ?? null;
    row.company_hq = ad.company_hq ?? null;
    row.team_size = ad.team_size;
    row.manage_others = ad.manage_others;
    row.direct_reports = ad.direct_reports ?? null;
    row.report_to = ad.report_to;
    row.negotiated = ad.negotiated;
    row.negotiation_outcome = ad.negotiation_outcome ?? null;
    row.negotiation_result = ad.negotiation_result ?? null;
    row.has_bonus = ad.has_bonus;
    row.bonus_range = ad.bonus_range ?? null;
    row.has_equity = ad.has_equity;
  }

  const { data: inserted, error } = await supabase
    .from("submissions")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  // Record rate limit
  await supabase
    .from("submission_rate_limits")
    .insert({ ip_hash: ipHash });

  return NextResponse.json({ success: true, id: inserted.id }, { status: 201 });
}
