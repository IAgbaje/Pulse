"use client";

import { useState, useCallback, useEffect } from "react";
import { track } from "@vercel/analytics";
import {
  formatCurrency,
  LEVEL_ORDER,
  LATEST_YEAR,
  MIN_SEGMENT_RECORDS,
  CURRENCY_SYMBOLS,
} from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import PercentileGauge from "@/components/PercentileGauge";
import TallyButton from "@/components/TallyButton";

interface CompareClientProps {
  totalCount: number;
  industries: string[];
}

interface SegmentAnchors {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

interface SegmentResponse {
  count: number;
  anchors: SegmentAnchors | null;
}

const COMPARE_URL = `${SITE_URL}/compare`;

// Estimate percentile rank by linear interpolation between the five anchors
// returned by the API. Mathematically exact at the anchors; smooth in between.
// Privacy-preserving: the dataset itself never leaves the server.
function estimateRank(value: number, a: SegmentAnchors): number {
  const points: [number, number][] = [
    [0, a.p10], [10, a.p10], [25, a.p25], [50, a.p50], [75, a.p75], [90, a.p90], [100, a.p90],
  ];
  if (value <= a.p10) return Math.max(0, Math.round(10 * (value / a.p10)));
  if (value >= a.p90) return Math.min(100, 90 + Math.round(10 * Math.min(1, (value - a.p90) / Math.max(a.p90, 1))));
  for (let i = 1; i < points.length; i++) {
    const [rLo, vLo] = points[i - 1];
    const [rHi, vHi] = points[i];
    if (value >= vLo && value <= vHi) {
      if (vHi === vLo) return Math.round(rLo);
      return Math.round(rLo + ((value - vLo) / (vHi - vLo)) * (rHi - rLo));
    }
  }
  return 50;
}

// Currencies captured in the Tally form
const CURRENCIES = [
  { value: "NGN", label: "Nigerian Naira (NGN)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
];

type ResultState = "above75" | "aboveMedian" | "belowMedian" | "insufficient" | null;

function getResultState(percentile: number, count: number): ResultState {
  if (count < MIN_SEGMENT_RECORDS) return "insufficient";
  if (percentile >= 75) return "above75";
  if (percentile >= 50) return "aboveMedian";
  return "belowMedian";
}

const resultCopy: Record<Exclude<ResultState, "insufficient" | null>, { headline: string; body: string }> = {
  above75: {
    headline: "You're earning in the top quarter.",
    body: "Your compensation sits above the 75th percentile for this segment. That's a strong position — but knowing where you stand is only half the work. If you haven't renegotiated recently, now is a good time to revisit.",
  },
  aboveMedian: {
    headline: "You're above the median — and there's room to push.",
    body: "You're earning more than half the professionals in this segment. The gap to the 75th percentile may be smaller than you think. The data shows that professionals who negotiate consistently close it.",
  },
  belowMedian: {
    headline: "Your market rate may be higher than your current offer.",
    body: "More than half of professionals at this level and industry earn above your current gross. The negotiation data is clear: those who ask earn significantly more. You have numbers to bring to that conversation.",
  },
};

// Social platforms
const PLATFORMS = [
  {
    name: "WhatsApp",
    color: "#25D366",
    bg: "rgba(37,211,102,0.10)",
    buildUrl: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    name: "X / Twitter",
    color: "#e7e7e7",
    bg: "rgba(231,231,231,0.08)",
    buildUrl: (text: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.262 5.638 5.903-5.638Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.12)",
    buildUrl: (_: string, url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    color: "#1877F2",
    bg: "rgba(24,119,242,0.12)",
    buildUrl: (_: string, url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

function formatSalaryDisplay(digits: string): string {
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return isNaN(num) ? digits : num.toLocaleString("en-NG");
}

export default function CompareClient({ totalCount, industries }: CompareClientProps) {
  const [currency, setCurrency] = useState("NGN");
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [salaryDigits, setSalaryDigits] = useState("");
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [segment, setSegment] = useState<SegmentResponse | null>(null);
  const [segmentLoading, setSegmentLoading] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? currency;

  const handleSalaryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryDigits(e.target.value.replace(/[^\d]/g, ""));
  }, []);

  const handleCurrencyChange = (val: string) => {
    setCurrency(val);
    setSubmitted(false);
    setSalaryDigits("");
  };

  const salaryDisplay = formatSalaryDisplay(salaryDigits);
  const parsedSalary = salaryDigits ? parseInt(salaryDigits, 10) : null;
  const salaryValid = parsedSalary !== null && parsedSalary > 0;

  // After submit, fetch percentile anchors from the API. Only the segment
  // descriptor (level/industry/currency/historical) leaves the browser — the
  // user's salary stays client-side.
  useEffect(() => {
    if (!submitted) { setSegment(null); return; }
    let cancelled = false;
    setSegmentLoading(true);
    fetch("/api/segment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        level: level || undefined,
        industry: industry || undefined,
        currency,
        includeHistorical,
      }),
    })
      .then((r) => r.json())
      .then((res: SegmentResponse) => { if (!cancelled) setSegment(res); })
      .finally(() => { if (!cancelled) setSegmentLoading(false); });
    return () => { cancelled = true; };
  }, [submitted, level, industry, currency, includeHistorical]);

  const stats = segment?.anchors
    ? { p25: segment.anchors.p25, median: segment.anchors.p50, p75: segment.anchors.p75, count: segment.count }
    : null;
  const percentileRank = segment?.anchors && parsedSalary !== null
    ? estimateRank(parsedSalary, segment.anchors)
    : 50;
  const resultState: ResultState = !submitted || parsedSalary === null || !segment
    ? null
    : getResultState(percentileRank, segment.count);

  const handleCompare = (e: React.FormEvent) => {
    e.preventDefault();
    if (salaryValid) {
      setSubmitted(true);
      // Funnel event only — the salary value itself is never sent anywhere.
      track("salary_compared", {
        currency,
        level: level || "all",
        industry: industry || "all",
        historical: includeHistorical,
      });
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setSalaryDigits("");
  };

  const segmentLabel =
    [level && level.split(" (")[0], industry].filter(Boolean).join(" · ") || "All professionals";

  const shareText = `I just benchmarked my salary on Pulse — Nigeria's anonymous compensation index. I'm at the ${percentileRank}th percentile for ${segmentLabel}. Check where you stand 👉`;

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="max-w-reading mx-auto px-6 pt-16 pb-10">
        <h1 className="text-3xl font-semibold text-cream mb-2">Where do you stand?</h1>
        <p className="text-sm text-cream-60 leading-relaxed">
          Enter your monthly gross salary to see where you rank among{" "}
          <span className="text-cream">{totalCount}</span> anonymized compensation records. No account needed.
        </p>
      </div>

      <div className="max-w-reading mx-auto px-6 pb-20">
        {/* Input form */}
        {!submitted && (
          <form onSubmit={handleCompare} className="surface-card space-y-5">

            {/* Currency */}
            <div>
              <label className="label-caps mb-2 block">Your currency</label>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="filter-select w-full"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="label-caps mb-2 block">Your role level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="filter-select w-full"
              >
                <option value="">All levels</option>
                {LEVEL_ORDER.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div>
              <label className="label-caps mb-2 block">Your industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="filter-select w-full"
              >
                <option value="">All industries</option>
                {industries.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Benchmark basis */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeHistorical}
                  onChange={(e) => setIncludeHistorical(e.target.checked)}
                  className="mt-0.5 accent-[#C8962A]"
                />
                <span className="text-xs text-cream-60 leading-relaxed">
                  Include 2023 historical records.{" "}
                  <span className="text-cream-40">
                    By default you&apos;re benchmarked against {LATEST_YEAR} data only — 2023
                    salaries predate major naira devaluation and can understate today&apos;s market.
                  </span>
                </span>
              </label>
            </div>

            {/* Salary — Option B prefix box */}
            <div>
              <label className="label-caps mb-2 block">Monthly gross salary</label>
              <div className="flex rounded-lg border border-[rgba(200,150,42,0.15)] focus-within:border-[rgba(200,150,42,0.40)] focus-within:shadow-[0_0_0_2px_rgba(200,150,42,0.10)] overflow-hidden transition-all duration-150">
                {/* Currency prefix */}
                <div className="flex items-center justify-center px-4 bg-[rgba(200,150,42,0.06)] border-r border-[rgba(200,150,42,0.15)] text-cream-60 text-sm font-semibold select-none flex-shrink-0 min-w-[48px]">
                  {currencySymbol}
                </div>
                {/* Input */}
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryDisplay}
                  onChange={handleSalaryChange}
                  placeholder="650,000"
                  style={{ background: "var(--bg-input)" }}
                  // 16px on mobile to suppress iOS Safari auto-zoom on focus.
                  className="flex-1 px-3 py-3 text-base sm:text-sm text-cream focus:outline-none placeholder:text-cream-30 font-body min-h-[44px]"
                  required
                />
              </div>
              {salaryDigits && !salaryValid && (
                <p className="text-xs text-[#F87171] mt-1.5">Enter a valid amount</p>
              )}
              {salaryValid && parsedSalary !== null && (
                <p className="text-xs text-cream-40 mt-1.5">
                  {formatCurrency(parsedSalary, currency)} monthly gross
                </p>
              )}
              {currency !== "NGN" && (
                <p className="text-xs text-cream-30 mt-1.5">
                  Note: {CURRENCIES.find(c => c.value === currency)?.label} data is limited — results may not be statistically significant yet.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!salaryValid}
              className="w-full bg-gold hover:bg-gold-hover disabled:opacity-40 disabled:cursor-not-allowed text-bg-primary font-semibold text-sm tracking-[0.05em] px-8 py-3.5 rounded-md transition-colors"
            >
              Compare my salary
            </button>

            <p className="text-xs text-cream-30 text-center">
              Your number is never stored or shared. This runs entirely in your browser.
            </p>
          </form>
        )}

        {/* Result */}
        {submitted && parsedSalary !== null && (
          <div className="space-y-6">
            {/* Context bar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cream-40 label-caps mb-0.5">Comparing against</p>
                <p className="text-sm text-cream font-medium">{segmentLabel}</p>
                <p className="text-xs text-cream-40">
                  {segment?.count ?? 0} {CURRENCIES.find(c => c.value === currency)?.label ?? currency} records with gross data ·{" "}
                  {includeHistorical ? "all years (2023 + " + LATEST_YEAR + ")" : `${LATEST_YEAR} dataset`}
                  {segmentLoading && " · loading…"}
                </p>
              </div>
              <button onClick={handleReset} className="text-xs text-gold hover:underline">
                Compare again
              </button>
            </div>

            {/* Insufficient */}
            {resultState === "insufficient" && (
              <div className="surface-card text-center py-10">
                <p className="text-cream font-semibold mb-2">Not enough data for this segment</p>
                <p className="text-sm text-cream-60 mb-4">
                  We have {segment?.count ?? 0} {currency} record{(segment?.count ?? 0) !== 1 ? "s" : ""} for this combination. We need at least {MIN_SEGMENT_RECORDS} for a reliable percentile.
                  {currency !== "NGN" && " As more professionals contribute in this currency, the picture will sharpen."}
                </p>
                <div className="flex items-center justify-center gap-4">
                  {!includeHistorical && (
                    <button
                      onClick={() => setIncludeHistorical(true)}
                      className="text-gold text-sm hover:underline"
                    >
                      Include 2023 historical records
                    </button>
                  )}
                  <button onClick={handleReset} className="text-gold text-sm hover:underline">
                    Adjust filters
                  </button>
                </div>
              </div>
            )}

            {/* Valid result */}
            {resultState && resultState !== "insufficient" && stats && (
              <>
                {/* Gauge */}
                <div className="surface-card">
                  <div className="mb-6">
                    <p className="text-xs text-cream-40 label-caps mb-1">Your salary</p>
                    <p className="font-display text-4xl text-gold">
                      {formatCurrency(parsedSalary, currency)}
                    </p>
                  </div>
                  <PercentileGauge
                    p25={stats.p25}
                    median={stats.median}
                    p75={stats.p75}
                    userValue={parsedSalary}
                    percentileRank={percentileRank}
                  />
                </div>

                {/* Result copy */}
                <div className="gold-card">
                  <p className="text-cream font-semibold mb-2">{resultCopy[resultState].headline}</p>
                  <p className="text-sm text-cream-60 leading-relaxed">{resultCopy[resultState].body}</p>
                </div>

                {/* Benchmarks */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "25th percentile", value: stats.p25 },
                    { label: "Median", value: stats.median },
                    { label: "75th percentile", value: stats.p75 },
                  ].map(({ label, value }) => (
                    <div key={label} className="surface-card text-center py-4">
                      <p className="font-display text-xl text-cream">{formatCurrency(value, currency)}</p>
                      <p className="text-xs text-cream-40 mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Share + Contribute */}
                <div className="surface-card space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-cream mb-1">Share your result</p>
                    <p className="text-xs text-cream-60 mb-4 leading-relaxed">
                      Every share brings in more data — and helps someone else walk into their next negotiation better informed.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PLATFORMS.map((platform) => (
                        <a
                          key={platform.name}
                          href={platform.buildUrl(shareText, COMPARE_URL)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => track("share_click", { platform: platform.name })}
                          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-md border border-[rgba(200,150,42,0.15)] text-xs font-medium transition-all hover:border-[rgba(200,150,42,0.30)]"
                          style={{ color: platform.color, background: platform.bg }}
                        >
                          {platform.icon}
                          <span>{platform.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[rgba(200,150,42,0.10)] pt-5">
                    <p className="text-sm font-semibold text-cream mb-1">Add your data</p>
                    <p className="text-xs text-cream-60 mb-3 leading-relaxed">
                      This comparison only works because others shared their numbers. It takes four minutes and stays completely anonymous.
                    </p>
                    <TallyButton variant="primary" />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
