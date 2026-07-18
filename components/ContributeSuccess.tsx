"use client";

// Post-submit success state. Rendered when the Tally form redirects back to
// /contribute?submitted=1. This is the single highest-conversion moment in the
// product: the user just spent ~4 minutes contributing, their intent ceiling
// is at its peak, and a share ask here is the cheapest way to grow the
// dataset. We fire `tally_completed` once on mount so Vercel Analytics gets
// the funnel-bottom event we previously had no visibility into.

import { useEffect } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { SITE_URL } from "@/lib/site";

const SHARE_TEXT =
  "I just added my salary to Pulse, Nigeria's anonymous tech compensation index. It took 4 minutes. Add yours and help everyone negotiate from data, not vibes 👇";

const SHARE_URL = `${SITE_URL}/contribute`;

// Third-party share targets use the --brand-* vars (globals.css), same as
// CompareClient's share row — semantic tokens (success/info) are reserved
// for status meaning and must not double as brand colors.
const PLATFORMS: {
  name: string;
  color: string;
  bg: string;
  href: (t: string, u: string) => string;
}[] = [
  {
    name: "WhatsApp",
    color: "var(--brand-whatsapp)",
    bg: "var(--brand-whatsapp-bg)",
    href: (t, u) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}`,
  },
  {
    name: "X / Twitter",
    color: "var(--brand-x)",
    bg: "var(--brand-x-bg)",
    href: (t, u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
  },
  {
    name: "LinkedIn",
    color: "var(--brand-linkedin)",
    bg: "var(--brand-linkedin-bg)",
    href: (_t, u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
];

export default function ContributeSuccess() {
  useEffect(() => {
    // Funnel-bottom event. Fires once per arrival regardless of refresh, which
    // is fine: duplicates round-trip via Vercel Analytics' dedup window.
    track("tally_completed");
  }, []);

  return (
    <div className="page-enter max-w-read mx-auto px-6 pt-20 pb-12 text-center">
      <div className="count-up mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-success bg-success-bg">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-success-bright"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="label-caps text-content-accent mb-3">Submission received</p>
      <h1 className="text-3xl md:text-4xl font-bold text-content-primary mb-4 text-balance leading-snug">
        Thank you. The index is better because of you.
      </h1>
      <p className="text-sm text-content-secondary leading-relaxed max-w-md mx-auto mb-8">
        Your record joins the dataset within 48 hours. From now on, every
        professional who compares their salary against your level, industry,
        or function is partly benchmarking against your contribution.
      </p>

      {/* Share: the single most valuable action right now */}
      <div className="surface-card text-left space-y-5">
        <div>
          <p className="text-sm font-bold text-content-primary mb-1">
            Now: bring one more person.
          </p>
          <p className="text-xs text-content-secondary leading-relaxed">
            One share to a function-specific group (engineering Slack, design
            Discord, your old PM WhatsApp) is worth more than a week of public
            posts. Most functions are still under 50 records, and that&apos;s where
            the breakdowns get unlocked.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PLATFORMS.map((p) => (
            <a
              key={p.name}
              href={p.href(SHARE_TEXT, SHARE_URL)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("share_click", { platform: p.name, source: "contribute_success" })}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-strong text-sm font-bold transition-colors duration-fast ease-standard min-h-[44px] hover:border-gold-active"
              style={{ color: p.color, background: p.bg }}
            >
              Share on {p.name}
            </a>
          ))}
        </div>
      </div>

      {/* Secondary CTAs: Compare is the natural next step */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href="/compare"
          className="bg-gold-500 hover:bg-gold-400 text-content-on-gold font-bold text-sm tracking-wide px-6 py-3.5 rounded-md transition-colors duration-fast ease-standard min-h-[44px] inline-flex items-center justify-center"
        >
          See where you stand
        </Link>
        <Link
          href="/insights"
          className="border border-gold hover:bg-surface-gold text-content-accent font-medium text-sm px-5 py-3 rounded-md transition-colors duration-fast ease-standard min-h-[44px] inline-flex items-center justify-center"
        >
          What the data reveals
        </Link>
      </div>
    </div>
  );
}
