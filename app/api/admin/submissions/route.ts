import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin credentials not configured");
  return createClient(url, key);
}

function isAuthorized(req: NextRequest): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = process.env.ADMIN_SECRET;
  if (!expected || !token) return false;
  return token === expected;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") ?? "pending";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 50), 100);
  const company = req.nextUrl.searchParams.get("company")?.trim() ?? "";

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("submissions")
    .select("*")
    .eq("status", status)
    .order("submission_date", { ascending: false })
    .limit(limit);

  if (company) {
    query = query.ilike("company_name", `%${company}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ submissions: data, count: data.length });
}

const EDITABLE_FIELDS = new Set([
  "function",
  "job_title",
  "role_level",
  "years_experience",
  "location",
  "location_state",
  "location_country",
  "work_arrangement",
  "currency",
  "monthly_gross",
  "monthly_net",
  "industry",
  "company_name",
  "company_stage",
  "company_size",
  "company_age",
  "negotiated",
  "negotiation_result",
  "negotiation_outcome",
  "benefits",
  "reviewer_note",
]);

export async function PUT(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id: string; updates: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !body.updates || typeof body.updates !== "object") {
    return NextResponse.json({ error: "id and updates object required" }, { status: 400 });
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body.updates)) {
    if (EDITABLE_FIELDS.has(key)) {
      sanitized[key] = value;
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return NextResponse.json({ error: "No valid editable fields provided" }, { status: 400 });
  }

  sanitized.reviewed_at = new Date().toISOString();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("submissions")
    .update(sanitized)
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: body.id, updated: Object.keys(sanitized).filter(k => k !== "reviewed_at") });
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id: string; action: "approve" | "reject"; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.id || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "id and action (approve|reject) required" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const newStatus = body.action === "approve" ? "approved" : "rejected";

  const { error } = await supabase
    .from("submissions")
    .update({
      status: newStatus,
      reviewed_at: new Date().toISOString(),
      reviewer_note: body.note ?? null,
    })
    .eq("id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: body.id, status: newStatus });
}
