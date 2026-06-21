import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ companies: [] });
  }

  const { data: matches } = await supabase
    .from("companies")
    .select("name, industry")
    .eq("active", true)
    .ilike("name", `%${q}%`)
    .order("name")
    .limit(10);

  const results = (matches ?? []).map((c) => ({
    name: c.name,
    industry: c.industry,
    known: true,
  }));

  const hasExact = results.some(
    (r) => r.name.toLowerCase() === q.toLowerCase(),
  );
  if (!hasExact) {
    results.push({ name: q, industry: null, known: false });
  }

  return NextResponse.json({ companies: results });
}
