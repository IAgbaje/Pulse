import type { Metadata } from "next";
import { getAllData } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Methodology | Pulse",
};

interface SectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

function Section({ number, title, children }: SectionProps) {
  return (
    <div className="border-l-2 border-[rgba(200,150,42,0.30)] pl-6 py-1">
      <p className="label-caps text-gold mb-1">{number}</p>
      <h2 className="text-lg font-semibold text-cream mb-3">{title}</h2>
      <div className="text-sm text-cream-60 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

export default function MethodologyPage() {
  const data = getAllData();
  const sources = [
    {
      label: "Community 2023",
      count: data.filter((r) => r.source === "community_2023").length,
      desc: "Collected by Lola Soleye, focusing on Product Management roles across Nigerian tech companies.",
    },
    // { label: "Community 2024", count: data.filter((r) => r.source === "community_2024").length, desc: "A follow-up collection by Lola Soleye, expanding coverage across seniority levels and industries." },
    {
      label: "Pulse 2026",
      count: data.filter((r) => r.source === "pulse_2026").length,
      desc: "Live anonymous submissions collected via Tally. This dataset grows continuously as professionals contribute.",
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero */}
      <div className="max-w-reading mx-auto px-6 pt-16 pb-12">
        <h1 className="text-3xl font-semibold text-cream mb-2">How the data works</h1>
        <p className="text-sm text-cream-60 leading-relaxed">
          Pulse is built on voluntary, anonymous contributions. Here&apos;s exactly what we collect, how we calculate it, and what to trust — and what to treat with caution.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-reading mx-auto px-6 pb-20 space-y-12">

        <Section number="01" title="Data sources">
          <p>
            The index combines independent datasets, each collected separately and merged into a single anonymized record set.
          </p>
          <div className="mt-4 space-y-4">
            {sources.map((s) => (
              <div key={s.label} className="gold-card">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-cream font-semibold text-sm">{s.label}</p>
                  <p className="font-display text-gold text-xl">{s.count}</p>
                </div>
                <p className="text-cream-60 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4">
            The 2023 community dataset was collected and curated by{" "}
            <strong className="text-cream">Lola Soleye</strong>
            , with a focus on Product Management compensation in Nigerian tech. We are grateful for her work in making this data accessible.
          </p>
        </Section>

        <Section number="02" title="What we measure">
          <p>
            All Nigerian Naira (NGN) aggregate statistics — median, 25th percentile, 75th percentile — are calculated using <strong className="text-cream">monthly gross salary</strong>. This is the number before tax and deductions.
          </p>
          <p>
            Records in GBP, USD, EUR, or other currencies represent diaspora and remote workers. They appear in the data table and recent submissions feed, but are excluded from ₦ aggregate calculations to avoid currency distortion. We display these with their original currency symbol.
          </p>
          <p>
            Records with only a net salary (no gross) are included in the total record count but excluded from percentile calculations. Where a gross salary is available, we use it exclusively for all benchmarking.
          </p>
        </Section>

        <Section number="03" title="How statistics are calculated">
          <p>
            When we calculate percentile values — the median, 25th, and 75th — we don&apos;t just pick the nearest number from a ranked list. We calculate a precise point between values, so the result reflects the actual spread of salaries rather than rounding to the closest submission. This matters most in smaller segments, where a simpler method would produce numbers that look more certain than they are.
          </p>
          <p>
            Every aggregate stat you see — by level, by industry — requires at least{" "}
            <strong className="text-cream">5 salary records</strong> before it&apos;s displayed. Below that threshold, the interface tells you there isn&apos;t enough data rather than showing a number that could mislead. A figure built on two or three submissions isn&apos;t a benchmark. It&apos;s a coincidence.
          </p>
          <p>
            The negotiation premium compares the median salary of professionals who negotiated their offer against the median of those who didn&apos;t — expressed as a percentage difference. Only records where someone gave a clear answer on negotiation and reported a gross salary in Naira are included. Ambiguous or missing responses don&apos;t factor in.
          </p>
        </Section>

        <Section number="04" title="Anonymization and privacy">
          <p>
            No personally identifying information is collected. The submission form does not ask for name, email, company name, job title (only function and level), or any other field that could reasonably identify an individual.
          </p>
          <p>
            Submissions are ingested as anonymized records only. Each record is assigned a random identifier when it enters the dataset. There is no way to trace a published data point back to the person who submitted it — including for the people who run this index.
          </p>
          <p>
            Where a record&apos;s combination of role, level, industry, and location is rare enough that it could point to a single person, those details are suppressed in record-level views.
          </p>
          <p>
            Gender is collected as an optional field for future equity analysis only. It is not published in the public dataset and would only ever be used in aggregate views where sample size is sufficient.
          </p>
        </Section>

        <Section number="05" title="Limitations">
          <p>
            Pulse is a <strong className="text-cream">self-reported, voluntary dataset</strong>. It is not a random sample. Professionals who choose to contribute may differ systematically from those who do not — skewed toward those who are actively job-searching, recently negotiated, or work in certain sectors and cities.
          </p>
          <p>
            {/* The 2023 and 2024 datasets have heavier representation in Product Management roles. */}
            The 2023 dataset has heavier representation in Product Management roles. The 2026 dataset is broader but still growing. Treat narrow-segment statistics (fewer than 20 records) as directional, not definitive.
          </p>
          <p>
            Compensation data ages quickly. Nigerian tech salaries are affected by inflation, forex movements, and talent market dynamics. Data from 2023 should be interpreted in its original economic context, not used as a baseline for 2026 negotiations without adjustment.
          </p>
          <p>
            Pulse is built and maintained independently. It is not affiliated with any employer, recruiter, or HR platform. The goal is transparency — not to advocate for any particular compensation outcome.
          </p>
        </Section>
      </div>

      {/* Attribution footer */}
      <div className="border-t border-[rgba(200,150,42,0.10)] bg-bg-surface">
        <div className="max-w-reading mx-auto px-6 py-10">
          <p className="label-caps text-gold mb-3">Built by</p>
          <p className="text-sm text-cream-60 leading-relaxed">
            Pulse is an independent project by{" "}
            <strong className="text-cream">Ibraheem Agbaje</strong>. The 2023 community dataset was collected and curated by{" "}
            <strong className="text-cream">Lola Soleye</strong>
            . Questions, corrections, or partnership inquiries can be directed via LinkedIn.
          </p>
        </div>
      </div>
    </div>
  );
}
