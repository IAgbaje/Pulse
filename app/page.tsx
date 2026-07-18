import type { Metadata } from "next";
import Link from "next/link";
import {
  getYearData,
  getAggregates,
  getByLevel,
  getTrend,
  formatCurrency,
  getNegotiationStats,
  LATEST_YEAR,
  MIN_SEGMENT_RECORDS,
} from "@/lib/data";
import { getAllData } from "@/lib/server-data";
import EKGLine from "@/components/EKGLine";
import { PulseFormTrigger } from "@/components/PulseForm";
import StatCard from "@/components/StatCard";
import SalaryChart from "@/components/SalaryChart";

export const metadata: Metadata = {
  title: "Pulse | Nigerian Tech Compensation Index",
};

export default async function HomePage() {
  const data = await getAllData();
  const current = getYearData(data, LATEST_YEAR);
  const agg = getAggregates(current);
  const byLevel = getByLevel(current);
  const negStats = getNegotiationStats(current);
  const trend = getTrend(data);

  const premiumValid =
    negStats.notNegotiatedMedian > 0 &&
    negStats.negotiatedCount >= MIN_SEGMENT_RECORDS &&
    negStats.notNegotiatedCount >= MIN_SEGMENT_RECORDS;
  const negotiationPremiumPct = premiumValid
    ? Math.round(
        ((negStats.negotiatedMedian - negStats.notNegotiatedMedian) /
          negStats.notNegotiatedMedian) *
          100
      )
    : null;

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--accent-fill-tint)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="display text-display-xl text-content-primary mb-2">
            PULSE
          </h1>
          <EKGLine />
          <p className="text-xl md:text-2xl text-content-primary font-light mt-4 mb-3 leading-snug">
            Nigerian tech talent has a voice. It&apos;s time it had data.
          </p>
          <p className="text-sm text-content-secondary mb-8 leading-relaxed max-w-md mx-auto">
            An anonymous compensation index for tech and business professionals in Nigeria.{" "}
            <span className="text-content-primary">{data.length}</span> data points. Yours could be next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="bg-gold-500 hover:bg-gold-400 text-content-on-gold font-semibold text-sm tracking-[0.05em] px-8 py-3.5 rounded-md transition-colors"
            >
              Explore the data
            </Link>
            <PulseFormTrigger variant="ghost" />
          </div>
        </div>
      </section>

      {/* Live Stats Bar: current dataset only */}
      <section className="bg-surface-base border-y border-gold">
        <div className="max-w-content mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="All-Time Data Points"
              value={data.length}
              variant="large"
            />
            <StatCard
              label={`Median Monthly Gross (${LATEST_YEAR})`}
              value={formatCurrency(agg.median)}
              subtitle={`${agg.countWithGross} NGN records with gross data`}
              variant="large"
            />
            {negotiationPremiumPct !== null ? (
              <StatCard
                label={`Negotiation Premium (${LATEST_YEAR})`}
                value={`${negotiationPremiumPct}%`}
                subtitle="Median gap: negotiated vs not"
                variant="large"
              />
            ) : (
              <StatCard
                label={`${LATEST_YEAR} Submissions`}
                value={current.length}
                subtitle="And growing. Add yours."
                variant="large"
              />
            )}
          </div>
        </div>
      </section>

      {/* Quick Snapshot */}
      <section className="max-w-content mx-auto px-6 py-20">
        <h2 className="display text-display-md text-content-primary mb-2">Compensation at a glance</h2>
        <p className="text-sm text-content-secondary mb-8">
          Current-year benchmarks, and how the market has moved since 2023.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-card">
            <p className="text-sm font-semibold text-content-primary mb-1">
              Median salary by level, {LATEST_YEAR} dataset
            </p>
            <p className="text-xs text-content-tertiary mb-4">
              Monthly gross (₦ NGN records) · segments with fewer than {MIN_SEGMENT_RECORDS} records are hidden
            </p>
            <SalaryChart data={byLevel} />
          </div>
          <div className="surface-card">
            <p className="text-sm font-semibold text-content-primary mb-1">Median gross by dataset year</p>
            <p className="text-xs text-content-tertiary mb-4">
              Each year shown separately. Salaries from different economic eras are never pooled.
            </p>
            <div className="flex gap-4 mb-5">
              {trend.map((t) => (
                <div key={t.year} className="gold-card flex-1">
                  <p className="label-caps mb-1">{t.year}</p>
                  <p className="display num text-display-sm text-content-accent">{formatCurrency(t.median)}</p>
                  <p className="text-xs text-content-tertiary mt-1">{t.count} records</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Nominal medians have barely moved between 2023 and {LATEST_YEAR}, across a period of
              steep naira devaluation and inflation. In real terms, that is a significant pay cut
              for Nigerian tech talent.
            </p>
          </div>
        </div>
        <p className="text-xs text-content-tertiary mt-4">
          Headline statistics use the {LATEST_YEAR} dataset only ({agg.countWithGross} NGN records
          with gross salary). The 2023 community dataset is available as a historical view on the
          Explore page.
        </p>
      </section>

      {/* CTA Banner */}
      <section className="border-y border-gold bg-surface-gold">
        <div className="max-w-read mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-content-primary mb-4 text-balance">
            Your four minutes will change someone&apos;s next negotiation.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <PulseFormTrigger variant="primary" />
            <Link
              href="/methodology"
              className="border border-gold-hover text-content-accent hover:bg-surface-gold font-medium text-sm px-5 py-3 rounded-md transition-colors"
            >
              Learn how it works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
