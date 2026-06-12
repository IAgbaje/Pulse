import type { Metadata } from "next";
import { getAllData } from "@/lib/data";
import TallyButton from "@/components/TallyButton";

export const metadata: Metadata = {
  title: "Contribute | Pulse",
};

const trustSignals = [
  "Completely anonymous — no name, email, or identifying information collected",
  "Takes four minutes. No account required.",
  "Your submission improves salary benchmarks for every professional after you",
  "Submissions appear only as anonymized records — never with anything that could identify you",
];

export default function ContributePage() {
  const data = getAllData();

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="max-w-reading mx-auto px-6 pt-16 pb-12 text-center">
        <p className="label-caps text-gold mb-4">{data.length} data points and counting</p>
        <h1 className="text-3xl md:text-4xl font-semibold text-cream mb-4 text-balance leading-snug">
          The index is only as good as what people put in.
        </h1>
        <p className="text-sm text-cream-60 leading-relaxed max-w-md mx-auto">
          Every salary shared makes the next negotiation sharper. You&apos;ve already used this data. Now it&apos;s your turn.
        </p>
      </div>

      {/* Body */}
      <div className="max-w-reading mx-auto px-6 pb-16 space-y-8">
        {/* Why it matters */}
        <div className="space-y-4 text-sm text-cream-60 leading-relaxed">
          <p>
            Nigerian tech salaries have been invisible for too long — buried in DMs, hushed in offices, whispered between trusted friends. Pulse exists to change that. The professionals who have contributed to this index are the reason anyone can benchmark, compare, or negotiate with real numbers instead of guesswork.
          </p>
          <p>
            Your submission doesn&apos;t need to be from a current role. If you recently changed jobs, negotiated an offer, or just want to add a data point from a role you&apos;ve left — it all helps. The more diverse the contributions, the more accurate the picture.
          </p>
          <p>
            All statistics are aggregated into the medians, percentiles, and charts you see across the site. Individual records appear only as anonymized rows — role, level, industry, salary — and where a combination of details is rare enough that it could point to one person, we suppress those details. There&apos;s no name, email, or company attached to anything, so there&apos;s no way to trace a data point back to a person — that&apos;s by design, not by policy.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <TallyButton variant="primary" />

          <ul className="mt-6 space-y-2 text-left max-w-xs mx-auto">
            {trustSignals.map((signal) => (
              <li key={signal} className="flex items-start gap-2 text-xs text-cream-40">
                <span className="text-gold mt-0.5 flex-shrink-0">✓</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What we collect */}
        <div className="surface-card">
          <p className="text-sm font-semibold text-cream mb-4">What the form asks</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              "Role level and function",
              "Industry and company stage",
              "Location and work arrangement",
              "Monthly gross salary",
              "Monthly net (optional)",
              "Whether you negotiated",
              "Benefits received",
              "Gender (optional, for equity analysis)",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-cream-60">
                <span className="w-1.5 h-1.5 rounded-full bg-gold/60 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-cream-30 mt-4">
            No name, email, company name, or any individually identifying field is collected.
          </p>
        </div>
      </div>
    </div>
  );
}
