import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllData,
  getAggregates,
  getByLevel,
  getByIndustry,
  formatCurrency,
  getNegotiationStats,
} from "@/lib/data";
import EKGLine from "@/components/EKGLine";
import TallyButton from "@/components/TallyButton";
import StatCard from "@/components/StatCard";
import SalaryChart from "@/components/SalaryChart";
import IndustryChart from "@/components/IndustryChart";

export const metadata: Metadata = {
  title: "Pulse | Nigerian Tech Compensation Index",
};

export default function HomePage() {
  const data = getAllData();
  const agg = getAggregates(data);
  const byLevel = getByLevel(data);
  const byIndustry = getByIndustry(data);
  const negStats = getNegotiationStats(data);
  const negotiationPremiumPct = negStats.notNegotiatedMedian > 0
    ? Math.round(((negStats.negotiatedMedian - negStats.notNegotiatedMedian) / negStats.notNegotiatedMedian) * 100)
    : 82;

  return (
    <>
      {/* Hero */}
      <section className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,150,42,0.04)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="font-display text-[64px] md:text-[80px] leading-none text-cream mb-2 tracking-wide">
            PULSE
          </h1>
          <EKGLine />
          <p className="text-xl md:text-2xl text-cream font-light mt-4 mb-3 leading-snug">
            Nigerian tech talent has a voice. It&apos;s time it had data.
          </p>
          <p className="text-sm text-cream-60 mb-8 leading-relaxed max-w-md mx-auto">
            An anonymous compensation index for tech and business professionals in Nigeria.{" "}
            <span className="text-cream">{data.length}</span> data points. Yours could be next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="bg-gold hover:bg-gold-hover text-bg-primary font-semibold text-sm tracking-[0.05em] px-8 py-3.5 rounded-md transition-colors"
            >
              Explore the data
            </Link>
            <TallyButton variant="ghost" />
          </div>
        </div>
      </section>

      {/* Live Stats Bar */}
      <section className="bg-bg-surface border-y border-[rgba(200,150,42,0.10)]">
        <div className="max-w-content mx-auto px-6 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Data Points"
              value={data.length}
              variant="large"
            />
            <StatCard
              label="Median Monthly Gross"
              value={formatCurrency(agg.median)}
              variant="large"
            />
            <StatCard
              label="Negotiation Premium"
              value={`${negotiationPremiumPct}%`}
              variant="large"
            />
          </div>
        </div>
      </section>

      {/* Quick Snapshot */}
      <section className="max-w-content mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold text-cream mb-2">Compensation at a glance</h2>
        <p className="text-sm text-cream-60 mb-8">
          Median salaries across levels and top industries in the dataset.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Median salary by level</p>
            <p className="text-xs text-cream-40 mb-4">Monthly gross (₦ NGN records)</p>
            <SalaryChart data={byLevel} />
          </div>
          <div className="surface-card">
            <p className="text-sm font-semibold text-cream mb-1">Top paying industries</p>
            <p className="text-xs text-cream-40 mb-4">Median monthly gross by sector</p>
            <IndustryChart data={byIndustry} />
          </div>
        </div>
        <p className="text-xs text-cream-40 mt-4">
          Source: Community Dataset (2023) + Pulse Submissions (2026) ·{" "}
          {agg.countWithGross} records with gross salary data
        </p>
      </section>

      {/* CTA Banner */}
      <section className="border-y border-[rgba(200,150,42,0.15)] bg-[rgba(200,150,42,0.03)]">
        <div className="max-w-reading mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-cream mb-4 text-balance">
            Your four minutes will change someone&apos;s next negotiation.
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <TallyButton variant="primary" />
            <Link
              href="/methodology"
              className="border border-[rgba(200,150,42,0.25)] text-gold hover:bg-[rgba(200,150,42,0.08)] font-medium text-sm px-5 py-3 rounded-md transition-colors"
            >
              Learn how it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
