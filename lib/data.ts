export interface CompensationRecord {
  source: 'community_2023' | 'pulse_2026';
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

export interface InsightSet {
  totalRecords: number;
  medianGross: number;
  negotiationPremium: number;
  byLevel: LevelStats[];
  byIndustry: IndustryStats[];
}

export interface LevelStats {
  level: string;
  count: number;
  median: number;
  p25: number;
  p75: number;
}

export interface IndustryStats {
  industry: string;
  count: number;
  median: number;
}

export function getMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function getPercentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

export function getByLevel(data: CompensationRecord[], level?: string): CompensationRecord[] {
  if (!level) return data;
  return data.filter((r) => r.role_level === level);
}

export function getByIndustry(data: CompensationRecord[], industry?: string): CompensationRecord[] {
  if (!industry || industry === 'All') return data;
  return data.filter((r) => r.industry === industry);
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `₦${Math.round(value / 1_000)}K`;
  }
  return `₦${value.toLocaleString()}`;
}

function getValidGross(records: CompensationRecord[]): number[] {
  return records
    .map((r) => r.monthly_gross)
    .filter((v): v is number => v !== null && v > 0 && v < 50_000_000);
}

const LEVEL_ORDER = [
  'Junior (0-2 yrs)',
  'Mid-level (2-4 yrs)',
  'Senior (4-8 yrs)',
  'Lead/Staff (6-10 yrs)',
  'Director',
];

export function getInsights(data: CompensationRecord[]): InsightSet {
  const allGross = getValidGross(data);
  const medianGross = getMedian(allGross);

  const negotiatedYes = getValidGross(data.filter((r) => r.negotiated === 'Yes'));
  const negotiatedNo = getValidGross(data.filter((r) => r.negotiated === 'No'));
  const medNeg = getMedian(negotiatedYes);
  const medNoNeg = getMedian(negotiatedNo);
  const negotiationPremium = medNoNeg > 0 ? Math.round(((medNeg - medNoNeg) / medNoNeg) * 100) : 82;

  const byLevel: LevelStats[] = LEVEL_ORDER.map((level) => {
    const records = getByLevel(data, level);
    const gross = getValidGross(records);
    return {
      level,
      count: records.length,
      median: getMedian(gross),
      p25: getPercentile(gross, 25),
      p75: getPercentile(gross, 75),
    };
  }).filter((s) => s.count > 0);

  const industries = ['Fintech', 'SaaS', 'Healthtech', 'Edtech', 'Logistics', 'Other'];
  const byIndustry: IndustryStats[] = industries
    .map((industry) => {
      const records = getByIndustry(data, industry);
      const gross = getValidGross(records);
      return {
        industry,
        count: records.length,
        median: getMedian(gross),
      };
    })
    .filter((s) => s.count >= 4);

  return { totalRecords: data.length, medianGross, negotiationPremium, byLevel, byIndustry };
}

export function getPercentileRank(values: number[], target: number): number {
  if (values.length === 0) return 50;
  const below = values.filter((v) => v < target).length;
  return Math.round((below / values.length) * 100);
}
