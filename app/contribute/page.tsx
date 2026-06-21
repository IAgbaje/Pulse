import type { Metadata } from "next";
import { TRACKED_FUNCTIONS, LATEST_YEAR } from "@/lib/data";
import { getAllData } from "@/lib/server-data";
import { PulseFormTrigger } from "@/components/PulseForm";
import ContributeSuccess from "@/components/ContributeSuccess";

export const metadata: Metadata = {
  title: "Contribute | Pulse",
};

const FUNCTION_TARGET = 50;

const trustSignals = [
  "Completely anonymous. No name, email, or identifying information collected.",
  "Takes 2-4 minutes. No account required.",
  "Your submission improves salary benchmarks for every professional after you",
  "Submissions appear only as anonymized records, never with anything that could identify you",
];

export default async function ContributePage({
  searchParams,
}: {
  searchParams?: { submitted?: string };
}) {
  const submitted = searchParams?.submitted === "1";
  const data = await getAllData();
  const currentYear = data.filter((r) => r.year === LATEST_YEAR);

  const functionProgress = TRACKED_FUNCTIONS.map((fn) => ({
    fn,
    count: currentYear.filter((r) => r.function === fn).length,
  }))
    .map((row) => ({ ...row, gap: Math.max(0, FUNCTION_TARGET - row.count) }))
    .sort((a, b) => b.gap - a.gap || a.fn.localeCompare(b.fn));

  return (
    <div className="pt-16">
      {submitted ? (
        <ContributeSuccess />
      ) : (
        <div className="max-w-reading mx-auto px-6 pt-16 pb-12 text-center">
          <p className="label-caps text-gold mb-4">{data.length} data points and counting</p>
          <h1 className="text-3xl md:text-4xl font-semibold text-cream mb-4 text-balance leading-snug">
            The index is only as good as what people put in.
          </h1>
          <p className="text-sm text-cream-60 leading-relaxed max-w-md mx-auto">
            Every salary shared makes the next negotiation sharper. You&apos;ve already used this data. Now it&apos;s your turn.
          </p>
        </div>
      )}

      {/* Body */}
      <div className="max-w-reading mx-auto px-6 pb-16 space-y-8">
        {/* Why it matters */}
        <div className="space-y-4 text-sm text-cream-60 leading-relaxed">
          <p>
            Nigerian tech salaries have been invisible for too long: buried in DMs, hushed in offices, whispered between trusted friends. Pulse exists to change that. The professionals who have contributed to this index are the reason anyone can benchmark, compare, or negotiate with real numbers instead of guesswork.
          </p>
          <p>
            Your submission doesn&apos;t need to be from a current role. If you recently changed jobs, negotiated an offer, or just want to add a data point from a role you&apos;ve left, it all helps. The more diverse the contributions, the more accurate the picture.
          </p>
          <p>
            All statistics are aggregated into the medians, percentiles, and charts you see across the site. Individual records appear only as anonymized rows (function, level, industry, city, salary): class labels that describe thousands of people each. There&apos;s no name, email, or company attached to anything, so there&apos;s no way to trace a data point back to a person. That&apos;s by design, not by policy.
          </p>
        </div>

        {/* Form trigger */}
        <div className="flex justify-center">
          <PulseFormTrigger />
        </div>

        {/* Trust signals */}
        <ul className="space-y-2 max-w-xs mx-auto">
          {trustSignals.map((signal) => (
            <li key={signal} className="flex items-start gap-2 text-xs text-cream-40">
              <span className="text-gold mt-0.5 flex-shrink-0">✓</span>
              <span>{signal}</span>
            </li>
          ))}
        </ul>

        {/* Per-function progress */}
        <div className="surface-card">
          <p className="text-sm font-semibold text-cream mb-1">Where the dataset needs you most</p>
          <p className="text-xs text-cream-40 mb-5">
            {LATEST_YEAR} submissions per function. Each function needs at least {FUNCTION_TARGET} records
            before reliable level-by-level breakdowns can be published.
          </p>
          <div className="space-y-3">
            {functionProgress.map(({ fn, count }) => {
              const pct = Math.min(100, Math.round((count / FUNCTION_TARGET) * 100));
              const met = count >= FUNCTION_TARGET;
              return (
                <div key={fn}>
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className={met ? "text-cream" : "text-cream-60"}>{fn}</span>
                    <span className="text-cream-40 tabular-nums">
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

        {/* What we collect */}
        <div className="surface-card">
          <p className="text-sm font-semibold text-cream mb-4">What the form asks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Role level and function",
              "Job title and experience",
              "Location and work arrangement",
              "Monthly gross salary",
              "Monthly net (optional)",
              "Industry and company context",
              "Benefits received",
              "Gender (for future equity analysis)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-cream-60">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-cream-30 mt-4">
            Company names are shown publicly alongside salary data to add credibility.
            Your identity stays completely anonymous — no name, email, or personally identifying information is collected.
          </p>
        </div>
      </div>
    </div>
  );
}
