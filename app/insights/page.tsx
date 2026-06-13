import type { Metadata } from "next";
import {
  getYearData,
  getByLevel,
  getAggregates,
  getNegotiationStats,
  getWorkArrangementStats,
  getTrend,
  getBenefitsBreakdown,
  formatCurrency,
  filterData,
  LATEST_YEAR,
  MIN_SEGMENT_RECORDS,
  TRACKED_FUNCTIONS,
  LEVEL_ORDER,
  getLevelShortLabel,
} from "@/lib/data";
import { getAllData } from "@/lib/server-data";
import InsightCard from "@/components/InsightCard";
import IndustryChart from "@/components/IndustryChart";
import NegotiationChart from "@/components/NegotiationChart";
import BenefitsChart from "@/components/BenefitsChart";
import CompositionChart, { type CompositionSlice } from "@/components/CompositionChart";

export const metadata: Metadata = {
  title: "Compensation Insights | Pulse",
};

interface CardDef {
  stat: string;
  title: string;
  body: string;
  basis: string;
}

export default function InsightsPage() {
  const data = getAllData();
  const current = getYearData(data, LATEST_YEAR);
  const trend = getTrend(data);

  // ---- Composition (current year): function, level, year, location ----
  const tally = <K extends string | number | null>(
    rows: typeof data,
    key: (r: typeof data[number]) => K | undefined | null,
  ): CompositionSlice[] => {
    const counts = new Map<string, number>();
    rows.forEach((r) => {
      const v = key(r);
      if (v === undefined || v === null || v === "") return;
      const label = String(v);
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
  };

  const functionSlices = tally(current, (r) => r.function);
  // Levels rendered in seniority order, not popularity order.
  const levelOrderIndex = new Map(LEVEL_ORDER.map((l, i) => [l, i]));
  const levelSlices = tally(current, (r) => r.role_level)
    .map((s) => ({ label: getLevelShortLabel(s.label), count: s.count, _ord: levelOrderIndex.get(s.label) ?? 99 }))
    .sort((a, b) => a._ord - b._ord)
    .map(({ label, count }) => ({ label, count }));
  const yearSlices = tally(data, (r) => r.year)
    .map((s) => ({ label: String(s.label), count: s.count }))
    .sort((a, b) => Number(a.label) - Number(b.label));
  const locationSlices = (() => {
    const raw = tally(current, (r) => r.location);
    // Collapse the long tail into "Other" so the donut stays readable.
    raw.sort((a, b) => b.count - a.count);
    const top = raw.slice(0, 5);
    const rest = raw.slice(5).reduce((sum, s) => sum + s.count, 0);
    return rest > 0 ? [...top, { label: "Other", count: rest }] : top;
  })();

  // ---- Per-function progress toward the campaign threshold ----
  const FUNCTION_TARGET = 50;
  const functionProgress = TRACKED_FUNCTIONS.map((fn) => ({
    fn,
    count: current.filter((r) => r.function === fn).length,
  }))
    .map((row) => ({ ...row, gap: Math.max(0, FUNCTION_TARGET - row.count) }))
    .sort((a, b) => b.gap - a.gap || a.fn.localeCompare(b.fn));

  const currentBasis = `${LATEST_YEAR} dataset`;
  const insightCards: CardDef[] = [];

  // 1. Real wages — the headline story. Nominal change between the earliest
  // and latest dataset years, against a backdrop of devaluation.
  if (trend.length > 1) {
    const first = trend[0];
    const last = trend[trend.length - 1];
    if (first.median > 0 && last.median > 0) {
      const nominalPct = Math.round(((last.median - first.median) / first.median) * 100);
      insightCards.push({
        stat: `${nominalPct >= 0 ? "+" : ""}${nominalPct}%`,
        basis: `${first.year} vs ${last.year}`,
        title: "Flat naira, shrinking value",
        body: `The median monthly gross moved from ${formatCurrency(first.median)} in ${first.year} to ${formatCurrency(last.median)} in ${last.year} — a ${Math.abs(nominalPct)}% nominal change across a period of steep naira devaluation and inflation. In real terms, Nigerian tech compensation has fallen substantially. If your salary hasn't moved since ${first.year}, you have taken a pay cut.`,
      });
    }
  }

  // 2. Negotiation premium — current year only, shown only when both groups
  // clear the minimum-records threshold.
  const negStats = getNegotiationStats(current);
  const premiumValid =
    negStats.notNegotiatedMedian > 0 &&
    negStats.negotiatedCount >= MIN_SEGMENT_RECORDS &&
    negStats.notNegotiatedCount >= MIN_SEGMENT_RECORDS;
  if (premiumValid) {
    const premiumPct = Math.round(
      ((negStats.negotiatedMedian - negStats.notNegotiatedMedian) / negStats.notNegotiatedMedian) * 100
    );
    insightCards.push({
      stat: `${premiumPct}%`,
      basis: currentBasis,
      title: "The negotiation premium",
      body: `Professionals in the ${LATEST_YEAR} dataset who negotiated their last salary earn a median of ${formatCurrency(negStats.negotiatedMedian)} monthly (${negStats.negotiatedCount} records). Those who didn't: ${formatCurrency(negStats.notNegotiatedMedian)} (${negStats.notNegotiatedCount} records). Part of this gap reflects seniority — senior people negotiate more — but the direction is consistent: asking costs nothing and silence isn't free.`,
    });
  }

  // 3. Who negotiates — current year.
  const totalAnswered = negStats.negotiatedCount + negStats.notNegotiatedCount;
  if (totalAnswered >= MIN_SEGMENT_RECORDS) {
    insightCards.push({
      stat: `${negStats.negotiatedPercent}%`,
      basis: currentBasis,
      title: "Who negotiates?",
      body: `${negStats.negotiatedPercent}% of ${LATEST_YEAR} respondents negotiated their compensation. Whatever side of that line you're on, the premium data above tells you which side pays better.`,
    });
  }

  // 4. Junior → senior multiplier. Falls back to the historical dataset when
  // the current year lacks enough junior records — labeled accordingly.
  const multiplierFrom = (records: typeof data, basis: string): CardDef | null => {
    const byLevel = getByLevel(records);
    const junior = byLevel.find((l) => l.level === "Junior (0-2 yrs)")?.median ?? 0;
    const senior = byLevel.find((l) => l.level === "Senior (4-8 yrs)")?.median ?? 0;
    if (junior <= 0 || senior <= 0) return null;
    return {
      stat: `${(senior / junior).toFixed(1)}×`,
      basis,
      title: "Junior to senior multiplier",
      body: `Median compensation for seniors (4–8 yrs) is ${(senior / junior).toFixed(1)}× the junior (0–2 yrs) median — ${formatCurrency(senior)} vs ${formatCurrency(junior)} monthly gross. Experience is the single biggest lever on pay in this dataset.`,
    };
  };
  const olderYears = trend.map((t) => t.year).filter((y) => y !== LATEST_YEAR);
  const multiplierCard =
    multiplierFrom(current, currentBasis) ??
    (olderYears.length
      ? multiplierFrom(getYearData(data, olderYears[olderYears.length - 1]), `${olderYears[olderYears.length - 1]} dataset (historical)`)
      : null);
  if (multiplierCard) insightCards.push(multiplierCard);

  // 5. Take-home ratio — current year, NGN records with both gross and net.
  const withNet = current.filter(
    (r) => r.currency === "NGN" && r.monthly_gross !== null && r.monthly_net !== null
  );
  if (withNet.length >= MIN_SEGMENT_RECORDS) {
    const avgTakeHome = Math.round(
      withNet.map((r) => (r.monthly_net! / r.monthly_gross!) * 100).reduce((a, b) => a + b, 0) /
        withNet.length
    );
    insightCards.push({
      stat: `${avgTakeHome}%`,
      basis: `${currentBasis} · ${withNet.length} records`,
      title: "Take-home ratio",
      body: `On average, ${LATEST_YEAR} respondents take home roughly ${avgTakeHome} kobo of every naira earned. Use this to convert the gross number on an offer letter into what actually lands in your account each month.`,
    });
  }

  // 6. Fintech — current year share and sector median.
  const fintechCurrent = filterData(current, { industry: "Fintech" });
  const fintechAgg = getAggregates(fintechCurrent);
  if (current.length > 0 && fintechAgg.countWithGross >= MIN_SEGMENT_RECORDS) {
    const fintechPct = Math.round((fintechCurrent.length / current.length) * 100);
    insightCards.push({
      stat: `${fintechPct}%`,
      basis: currentBasis,
      title: "Fintech leads the dataset",
      body: `${fintechPct}% of ${LATEST_YEAR} submissions come from fintech, with a sector median of ${formatCurrency(fintechAgg.median)} monthly gross (${fintechAgg.countWithGross} records). It remains the gravitational center of Nigerian tech hiring.`,
    });
  }

  // 7. Benefits — current year.
  const benefits = getBenefitsBreakdown(current);
  const withAnyBenefits = current.filter(
    (r) => r.benefits && r.benefits.toLowerCase() !== "none" && r.benefits.toLowerCase() !== "n/a" && r.benefits.trim() !== ""
  ).length;
  if (current.length >= MIN_SEGMENT_RECORDS && benefits.length > 0) {
    const withBenefitsPct = Math.round((withAnyBenefits / current.length) * 100);
    insightCards.push({
      stat: `${withBenefitsPct}%`,
      basis: currentBasis,
      title: "Benefits are part of the deal",
      body: `${withBenefitsPct}% of ${LATEST_YEAR} respondents receive at least one non-cash benefit. ${benefits[0].benefit} is the most common at ${benefits[0].percent}% of submissions. When evaluating an offer, the full package — not just gross salary — is what determines your real compensation.`,
    });
  }

  const workStats = getWorkArrangementStats(data);
  const workChartData = workStats.map((w) => ({
    industry: w.arrangement.replace("Fully ", "").replace(" in-office", ""),
    median: w.median,
    p25: 0,
    p75: 0,
    count: w.count,
  }));

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="max-w-content mx-auto px-6 pt-16 pb-8">
        <h1 className="text-3xl font-semibold text-cream mb-2">What the data reveals</h1>
        <p className="text-sm text-cream-60">
          Key findings from {data.length} compensation records. Every number below states which
          slice of the data it comes from — and nothing is shown below {MIN_SEGMENT_RECORDS} records.
        </p>
      </div>

      {/* Composition — who has answered so far */}
      <div className="border-t border-[rgba(200,150,42,0.10)] bg-bg-surface">
        <div className="max-w-content mx-auto px-6 py-12">
          <div className="mb-8">
            <p className="label-caps text-gold mb-2">Who answered</p>
            <h2 className="text-xl font-semibold text-cream mb-1">
              Inside the {LATEST_YEAR} dataset — {current.length} respondents so far
            </h2>
            <p className="text-sm text-cream-60 max-w-2xl">
              The shape of the dataset determines the strength of every number on this page. Where
              one slice dominates, the headline insights describe that slice more than the market.
              These charts make that visible — and make the gaps obvious.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="surface-card">
              <CompositionChart
                title="Function"
                caption={`${functionSlices.length} functions represented in ${LATEST_YEAR}`}
                data={functionSlices}
              />
            </div>
            <div className="surface-card">
              <CompositionChart
                title="Role level"
                caption={`${LATEST_YEAR} respondents by seniority`}
                data={levelSlices}
              />
            </div>
            <div className="surface-card">
              <CompositionChart
                title="Location"
                caption={`Top 5 locations in ${LATEST_YEAR}, plus all others`}
                data={locationSlices}
              />
            </div>
            <div className="surface-card">
              <CompositionChart
                title="Records by dataset year"
                caption="The 2023 community dataset and 2026 Pulse submissions, side by side"
                data={yearSlices}
              />
            </div>
          </div>

          {/* Progress vs target — where the dataset needs help next */}
          <div className="surface-card mt-6">
            <p className="text-sm font-semibold text-cream mb-1">
              Where the dataset needs you next
            </p>
            <p className="text-xs text-cream-40 mb-5">
              {LATEST_YEAR} submissions per function · target {FUNCTION_TARGET} before reliable
              level-by-level breakdowns are published
            </p>
            <div className="space-y-3">
              {functionProgress.map(({ fn, count }) => {
                const pct = Math.min(100, Math.round((count / FUNCTION_TARGET) * 100));
                const met = count >= FUNCTION_TARGET;
                return (
                  <div key={fn}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className={met ? "text-cream" : "text-cream-60"}>{fn}</span>
                      <span className="text-cream-40 tabular-nums whitespace-nowrap">
                        {count}/{FUNCTION_TARGET}
                        {met && <span className="ml-2 text-gold">target met</span>}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(200,150,42,0.08)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold transition-all duration-500"
                        style={{ width: `${pct}%`, opacity: met ? 1 : 0.4 + (pct / 100) * 0.6 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Insight cards */}
      <div className="max-w-content mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightCards.map((card, i) => (
            <InsightCard key={card.title} {...card} index={i} />
          ))}
        </div>
      </div>

      {/* Salary charts */}
      <div className="max-w-content mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Salary by level and negotiation status</p>
            <p className="text-xs text-cream-40 mb-4">
              All years pooled — directional view · levels shown only where both groups have ≥{MIN_SEGMENT_RECORDS} records
            </p>
            <NegotiationChart data={data} />
          </div>
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Compensation by work arrangement</p>
            <p className="text-xs text-cream-40 mb-4">
              All years pooled — directional view · median monthly gross by work setup
            </p>
            <IndustryChart data={workChartData} />
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="border-t border-[rgba(200,150,42,0.10)] bg-bg-surface">
        <div className="max-w-content mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-cream mb-1">Beyond the paycheck</h2>
          <p className="text-sm text-cream-60 mb-8">
            Non-cash benefits reported in the {LATEST_YEAR} dataset — from health cover to stock options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="surface-card">
              <p className="text-sm font-semibold text-cream mb-1">Most common benefits</p>
              <p className="text-xs text-cream-40 mb-5">% of {LATEST_YEAR} respondents who listed each benefit</p>
              <BenefitsChart data={benefits} totalRecords={current.length} />
            </div>
            <div className="space-y-4">
              <div className="gold-card">
                <p className="label-caps mb-1">What to look for in an offer</p>
                <p className="text-sm text-cream-60 leading-relaxed">
                  Health insurance (HMO) and pension contributions are the baseline expectation at most Nigerian tech companies. Stock options and ESOP grants are rarer but materially valuable — especially at early-stage startups. Always ask whether the equity vests, over what period, and at what valuation.
                </p>
              </div>
              <div className="gold-card">
                <p className="label-caps mb-1">The hidden value of allowances</p>
                <p className="text-sm text-cream-60 leading-relaxed">
                  Data allowances, transport stipends, and 13th-month bonuses don&apos;t appear in your monthly gross — but they compound over a year. A ₦400K gross role with a data allowance, transport, and 13th month can outperform a ₦450K offer with nothing else attached.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend section */}
      {trend.length > 1 && (
        <div className="border-t border-[rgba(200,150,42,0.10)]">
          <div className="max-w-content mx-auto px-6 py-12">
            <h2 className="text-xl font-semibold text-cream mb-2">Compensation over time</h2>
            <p className="text-sm text-cream-60 mb-6">
              Each dataset year, shown separately. These are nominal naira figures — they are not
              adjusted for inflation or devaluation, and should not be compared as if the naira held
              its value between snapshots.
            </p>
            <div className="flex flex-wrap gap-6">
              {trend.map((t) => (
                <div key={t.year} className="gold-card flex-1 min-w-[140px]">
                  <p className="label-caps mb-1">{t.year}</p>
                  <p className="font-display text-3xl text-gold">{formatCurrency(t.median)}</p>
                  <p className="text-xs text-cream-40 mt-1">{t.count} records</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
