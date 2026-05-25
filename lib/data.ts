import seedData from "@/data/seed.json";
import community2024Data from "@/data/community_2024.json";

export interface CompensationRecord {
  source: "community_2023" | "pulse_2026" | "community_2024";
  source_label: string;
  function: string;
  role_level: string;
  gender: string | null;
  location: string | null;
  work_arrangement: string | null;
  industry: string | null;
  company_stage: string | null;
  company_size: string | null;
  currency: string;
  monthly_gross: number | null;
  monthly_net: number | null;
  negotiated: string | null;
  benefits: string | null;
  year: number;
}

export interface Filters {
  level?: string;
  industry?: string;
  location?: string;
  stage?: string;
  source?: string;
  year?: number;
}

export interface Aggregates {
  median: number;
  p25: number;
  p75: number;
  count: number;
  countWithGross: number;
  min: number;
  max: number;
}

export interface LevelBreakdown {
  level: string;
  median: number;
  p25: number;
  p75: number;
  count: number;
}

export interface IndustryBreakdown {
  industry: string;
  median: number;
  p25: number;
  p75: number;
  count: number;
}

export interface SalaryBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface TrendPoint {
  year: number;
  median: number;
  count: number;
  byLevel: { level: string; median: number; count: number }[];
}

export const LEVEL_ORDER = [
  "Junior (0-2 yrs)",
  "Mid-level (2-4 yrs)",
  "Senior (4-8 yrs)",
  "Lead/Staff (6-10 yrs)",
  "Director",
];

export const INDUSTRY_ORDER = [
  "Fintech",
  "Financial Services",
  "SaaS",
  "Healthtech",
  "Edtech",
  "Logistics",
  "Consulting",
  "Public Sector",
  "Other",
];

export function getAllData(): CompensationRecord[] {
  return [
    ...(seedData as CompensationRecord[]),
    ...(community2024Data as CompensationRecord[]),
  ];
}

export function getNGNRecordsWithGross(data: CompensationRecord[]): number[] {
  return data
    .filter((r) => r.currency === "NGN" && r.monthly_gross !== null)
    .map((r) => r.monthly_gross as number);
}

export function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function getPercentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return Math.round(sorted[lower] * (1 - weight) + sorted[upper] * weight);
}

export function getPercentileRank(values: number[], value: number): number {
  if (values.length === 0) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  return Math.round((below / sorted.length) * 100);
}

export function filterData(data: CompensationRecord[], filters: Filters): CompensationRecord[] {
  return data.filter((r) => {
    if (filters.level && r.role_level !== filters.level) return false;
    if (filters.industry && r.industry !== filters.industry) return false;
    if (filters.location && r.location !== filters.location) return false;
    if (filters.stage && r.company_stage !== filters.stage) return false;
    if (filters.source && r.source !== filters.source) return false;
    if (filters.year && r.year !== filters.year) return false;
    return true;
  });
}

export function getAggregates(data: CompensationRecord[]): Aggregates {
  const grossValues = getNGNRecordsWithGross(data);
  if (grossValues.length === 0) {
    return { median: 0, p25: 0, p75: 0, count: data.length, countWithGross: 0, min: 0, max: 0 };
  }
  return {
    median: getMedian(grossValues),
    p25: getPercentile(grossValues, 25),
    p75: getPercentile(grossValues, 75),
    count: data.length,
    countWithGross: grossValues.length,
    min: Math.min(...grossValues),
    max: Math.max(...grossValues),
  };
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: "₦",
  GBP: "£",
  USD: "$",
  USDT: "$",
  EUR: "€",
  CAD: "C$",
};

export function formatCurrency(value: number, currency = "NGN"): string {
  if (!value || value === 0) return "—";
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  if (currency === "NGN") {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₦${Math.round(value / 1000)}K`;
    return `₦${value.toLocaleString()}`;
  }
  if (value >= 1000) return `${symbol}${Math.round(value / 1000)}K`;
  return `${symbol}${value.toLocaleString()}`;
}

// Get gross salary values for any currency (generalised form of getNGNRecordsWithGross)
export function getGrossValues(data: CompensationRecord[], currency: string): number[] {
  return data
    .filter((r) => r.currency === currency && r.monthly_gross !== null)
    .map((r) => r.monthly_gross as number);
}

export function formatCurrencyFull(value: number, currency = "NGN"): string {
  if (!value || value === 0) return "—";
  const symbol = currency === "GBP" ? "£" : currency === "USDT" ? "$" : "₦";
  return `${symbol}${value.toLocaleString()}`;
}

export function getSalaryBuckets(
  data: CompensationRecord[],
  bucketSize = 200000
): SalaryBucket[] {
  const values = getNGNRecordsWithGross(data);
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const buckets: SalaryBucket[] = [];
  for (let min = 0; min <= max; min += bucketSize) {
    const bucketMax = min + bucketSize;
    const count = values.filter((v) => v >= min && v < bucketMax).length;
    if (count > 0 || min < max) {
      buckets.push({ range: `${formatCurrency(min)}–${formatCurrency(bucketMax)}`, min, max: bucketMax, count });
    }
  }
  return buckets.filter((b) => b.count > 0);
}

export function getByLevel(data: CompensationRecord[]): LevelBreakdown[] {
  return LEVEL_ORDER.map((level) => {
    const values = data
      .filter((r) => r.role_level === level && r.currency === "NGN" && r.monthly_gross !== null)
      .map((r) => r.monthly_gross as number);
    return {
      level,
      median: getMedian(values),
      p25: getPercentile(values, 25),
      p75: getPercentile(values, 75),
      count: values.length,
    };
  }).filter((l) => l.count > 0);
}

export function getByIndustry(data: CompensationRecord[]): IndustryBreakdown[] {
  const allIndustries = Array.from(new Set(data.map((r) => r.industry).filter((i): i is string => i !== null)));
  const ordered = [
    ...INDUSTRY_ORDER.filter((i) => allIndustries.includes(i)),
    ...allIndustries.filter((i) => !INDUSTRY_ORDER.includes(i)),
  ];
  return ordered.map((industry) => {
    const values = data
      .filter((r) => r.industry === industry && r.currency === "NGN" && r.monthly_gross !== null)
      .map((r) => r.monthly_gross as number);
    return {
      industry,
      median: getMedian(values),
      p25: getPercentile(values, 25),
      p75: getPercentile(values, 75),
      count: values.length,
    };
  }).filter((i) => i.count > 0);
}

export function getTrend(data: CompensationRecord[]): TrendPoint[] {
  const years = Array.from(new Set(data.map((r) => r.year))).sort();
  return years.map((year) => {
    const yearData = data.filter((r) => r.year === year);
    const grossValues = getNGNRecordsWithGross(yearData);
    return {
      year,
      median: getMedian(grossValues),
      count: yearData.length,
      byLevel: LEVEL_ORDER.map((level) => {
        const lv = getNGNRecordsWithGross(yearData.filter((r) => r.role_level === level));
        return { level, median: getMedian(lv), count: lv.length };
      }).filter((l) => l.count > 0),
    };
  }).filter((y) => y.count > 0);
}

export function getNegotiationStats(data: CompensationRecord[]) {
  const ngn = data.filter((r) => r.currency === "NGN" && r.monthly_gross !== null);
  const negotiated = ngn
    .filter((r) => r.negotiated === "Yes" || r.negotiated === "Sort of")
    .map((r) => r.monthly_gross as number);
  const notNegotiated = ngn
    .filter((r) => r.negotiated === "No")
    .map((r) => r.monthly_gross as number);
  const total = ngn.filter((r) => r.negotiated !== null).length;
  return {
    negotiatedMedian: getMedian(negotiated),
    notNegotiatedMedian: getMedian(notNegotiated),
    negotiatedCount: negotiated.length,
    notNegotiatedCount: notNegotiated.length,
    negotiatedPercent: total > 0 ? Math.round((negotiated.length / total) * 100) : 0,
  };
}

export function getWorkArrangementStats(data: CompensationRecord[]) {
  const arrangements = ["Fully remote", "Hybrid", "Fully in-office"];
  return arrangements.map((arr) => {
    const values = data
      .filter((r) => r.work_arrangement === arr && r.currency === "NGN" && r.monthly_gross !== null)
      .map((r) => r.monthly_gross as number);
    return { arrangement: arr, median: getMedian(values), count: values.length };
  }).filter((a) => a.count > 0);
}

export function getFilterOptions(data: CompensationRecord[]) {
  const unique = <T>(arr: (T | null | undefined)[]): T[] =>
    Array.from(new Set(arr.filter((v): v is T => v !== null && v !== undefined)));
  return {
    levels: LEVEL_ORDER.filter((l) => data.some((r) => r.role_level === l)),
    industries: [
      ...INDUSTRY_ORDER.filter((i) => data.some((r) => r.industry === i)),
      ...unique(data.map((r) => r.industry)).filter((i) => !INDUSTRY_ORDER.includes(i)),
    ],
    locations: unique(data.map((r) => r.location)).sort(),
    stages: unique(data.map((r) => r.company_stage)).sort(),
    years: unique(data.map((r) => r.year)).sort() as number[],
    sources: unique(data.map((r) => r.source)).sort(),
  };
}

export function getRecentSubmissions(data: CompensationRecord[], limit = 20): CompensationRecord[] {
  return [...data]
    .sort((a, b) => b.year - a.year || (b.source > a.source ? 1 : -1))
    .slice(0, limit);
}

export function getLevelShortLabel(level: string): string {
  const map: Record<string, string> = {
    "Junior (0-2 yrs)": "Junior",
    "Mid-level (2-4 yrs)": "Mid-level",
    "Senior (4-8 yrs)": "Senior",
    "Lead/Staff (6-10 yrs)": "Lead / Staff",
    Director: "Director",
  };
  return map[level] ?? level;
}

export function getCurrencySymbol(currency: string): string {
  if (currency === "GBP") return "£";
  if (currency === "USDT") return "$";
  return "₦";
}

export function isDiaspora(record: CompensationRecord): boolean {
  return record.currency !== "NGN";
}

export interface BenefitStat {
  benefit: string;
  count: number;
  percent: number;
}

// Normalize raw benefit strings to canonical labels
const BENEFIT_ALIASES: [RegExp, string][] = [
  [/hmo|health\s*ins|medical/i, "Health Insurance"],
  [/pension|pfa|retirement/i, "Pension"],
  [/data\s*(allow|sub|plan)?|phone\s*credit|airtime/i, "Data Allowance"],
  [/laptop|macbook|device|computer/i, "Laptop / Device"],
  [/13th\s*month|thirteenth/i, "13th Month Salary"],
  [/esop|stock\s*opt|equity|shares/i, "Stock Options / ESOP"],
  [/leave\s*allow|paid\s*leave|annual\s*leave/i, "Leave Allowance"],
  [/bonus|profit\s*shar|commission/i, "Performance Bonus"],
  [/transport|commute|fuel\s*allow/i, "Transport Allowance"],
  [/gym|fitness|wellness/i, "Gym / Wellness"],
  [/lunch|meal|food/i, "Meal / Lunch"],
  [/workspace|work\s*from\s*home|remote\s*allow|wfh/i, "Remote Work Allowance"],
  [/life\s*ins|group\s*life/i, "Life Insurance"],
  [/passage|travel\s*allow/i, "Travel / Passage Allowance"],
];

function normalizeBenefit(raw: string): string {
  const trimmed = raw.trim();
  for (const [pattern, label] of BENEFIT_ALIASES) {
    if (pattern.test(trimmed)) return label;
  }
  // Title-case any unmatched benefit
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

export function getBenefitsBreakdown(data: CompensationRecord[]): BenefitStat[] {
  const total = data.length;
  if (total === 0) return [];

  const counts: Record<string, number> = {};
  data.forEach((r) => {
    if (!r.benefits || r.benefits.toLowerCase() === "none" || r.benefits.toLowerCase() === "n/a") return;
    r.benefits
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean)
      .forEach((raw) => {
        const key = normalizeBenefit(raw);
        counts[key] = (counts[key] || 0) + 1;
      });
  });

  return Object.entries(counts)
    .map(([benefit, count]) => ({
      benefit,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
