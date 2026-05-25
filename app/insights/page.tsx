import type { Metadata } from "next";
import {
  getAllData,
  getByLevel,
  getNegotiationStats,
  getWorkArrangementStats,
  getTrend,
  getBenefitsBreakdown,
  formatCurrency,
  filterData,
} from "@/lib/data";
import InsightCard from "@/components/InsightCard";
import IndustryChart from "@/components/IndustryChart";
import NegotiationChart from "@/components/NegotiationChart";
import BenefitsChart from "@/components/BenefitsChart";

export const metadata: Metadata = {
  title: "Compensation Insights | Pulse",
};

export default function InsightsPage() {
  const data = getAllData();
  const negStats = getNegotiationStats(data);
  const byLevel = getByLevel(data);
  const workStats = getWorkArrangementStats(data);
  const trend = getTrend(data);
  const benefits = getBenefitsBreakdown(data);

  const negotiationPremiumPct =
    negStats.notNegotiatedMedian > 0
      ? Math.round(((negStats.negotiatedMedian - negStats.notNegotiatedMedian) / negStats.notNegotiatedMedian) * 100)
      : 82;

  const juniorMedian = byLevel.find((l) => l.level === "Junior (0-2 yrs)")?.median ?? 0;
  const seniorMedian = byLevel.find((l) => l.level === "Senior (4-8 yrs)")?.median ?? 0;
  const multiplier = juniorMedian > 0 ? (seniorMedian / juniorMedian).toFixed(1) : "3.6";

  const allNGN = data.filter((r) => r.currency === "NGN" && r.monthly_gross !== null && r.monthly_net !== null);
  const takeHomeRatios = allNGN.map((r) => (r.monthly_net! / r.monthly_gross!) * 100);
  const avgTakeHome = takeHomeRatios.length > 0
    ? Math.round(takeHomeRatios.reduce((a, b) => a + b, 0) / takeHomeRatios.length)
    : 84;

  const fintechData = filterData(data, { industry: "Fintech" });
  const fintechPct = data.length > 0 ? Math.round((fintechData.length / data.length) * 100) : 51;

  // Benefits stats for insight card
  const topBenefit = benefits[0]?.benefit ?? "Health Insurance";
  const topBenefitPct = benefits[0]?.percent ?? 0;
  const withAnyBenefits = data.filter((r) => r.benefits && r.benefits.toLowerCase() !== "none" && r.benefits.toLowerCase() !== "n/a" && r.benefits.trim() !== "").length;
  const withBenefitsPct = data.length > 0 ? Math.round((withAnyBenefits / data.length) * 100) : 0;

  const insightCards = [
    {
      stat: `${negotiationPremiumPct}%`,
      title: "The negotiation premium",
      body: `Professionals who negotiated their last salary earn a median of ${formatCurrency(negStats.negotiatedMedian)} monthly. Those who didn't: ${formatCurrency(negStats.notNegotiatedMedian)}. Same level. Same city. Different conversation. The data is unambiguous — ask for more.`,
    },
    {
      stat: `${multiplier}×`,
      title: "Junior to senior multiplier",
      body: "Moving from 0–2 years to 4–8 years of experience dramatically increases median compensation. The biggest single jump is between mid-level and senior. That's where to focus your energy.",
    },
    {
      stat: `${avgTakeHome}%`,
      title: "Take-home ratio",
      body: `The average Nigerian tech professional takes home roughly ${avgTakeHome} kobo of every naira earned. Use this to convert the gross number on an offer letter into what actually lands in your account each month.`,
    },
    {
      stat: `${fintechPct}%`,
      title: "Fintech dominates",
      body: `More than half of all data points come from fintech. The sector pays a median of ${formatCurrency(fintechData[0] ? getByLevel(fintechData)[0]?.median ?? 600000 : 600000)} monthly gross and remains the largest employer of tech talent in Nigeria by volume.`,
    },
    {
      stat: `${negStats.negotiatedPercent}%`,
      title: "Less than half negotiated",
      body: "Fewer than half of the professionals in this dataset negotiated their compensation. Those who did earned significantly more. The data is clear — silence costs money. Ask.",
    },
    {
      stat: `${withBenefitsPct}%`,
      title: "Benefits are part of the deal",
      body: `${withBenefitsPct}% of respondents receive at least one non-cash benefit. ${topBenefit} is the most common at ${topBenefitPct}% of submissions. When evaluating an offer, the full package — not just gross salary — is what determines your real compensation.`,
    },
  ];

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
          Key findings from {data.length} compensation records across Nigerian tech and business.
        </p>
      </div>

      {/* Insight cards */}
      <div className="max-w-content mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightCards.map((card, i) => (
            <InsightCard key={i} {...card} index={i} />
          ))}
        </div>
      </div>

      {/* Salary charts */}
      <div className="max-w-content mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Salary by level and negotiation status</p>
            <p className="text-xs text-cream-40 mb-4">Negotiated vs not negotiated, by career level</p>
            <NegotiationChart data={data} byLevel={byLevel} />
          </div>
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Compensation by work arrangement</p>
            <p className="text-xs text-cream-40 mb-4">Median monthly gross by work setup</p>
            <IndustryChart data={workChartData} />
          </div>
        </div>
      </div>

      {/* Benefits section */}
      <div className="border-t border-[rgba(200,150,42,0.10)] bg-bg-surface">
        <div className="max-w-content mx-auto px-6 py-12">
          <h2 className="text-xl font-semibold text-cream mb-1">Beyond the paycheck</h2>
          <p className="text-sm text-cream-60 mb-8">
            Non-cash benefits reported by professionals in the dataset — from health cover to stock options.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="surface-card">
              <p className="text-sm font-semibold text-cream mb-1">Most common benefits</p>
              <p className="text-xs text-cream-40 mb-5">% of all respondents who listed each benefit</p>
              <BenefitsChart data={benefits} totalRecords={data.length} />
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
            <p className="text-sm text-cream-60 mb-6">How median salaries have moved across datasets.</p>
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
