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

const PLATFORMS = [
  {
    name: "WhatsApp",
    color: "#25D366",
    bg: "rgba(37,211,102,0.10)",
    href: (t: string, u: string) => `https://wa.me/?text=${encodeURIComponent(t + " " + u)}`,
  },
  {
    name: "X / Twitter",
    color: "#e7e7e7",
    bg: "rgba(231,231,231,0.08)",
    href: (t: string, u: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}`,
  },
  {
    name: "LinkedIn",
    color: "#0A66C2",
    bg: "rgba(10,102,194,0.12)",
    href: (_t: string, u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
];

export default function ContributeSuccess() {
  useEffect(() => {
    // Funnel-bottom event. Fires once per arrival regardless of refresh, which
    // is fine: duplicates round-trip via Vercel Analytics' dedup window.
    track("tally_completed");
  }, []);

  return (
    <div className="max-w-reading mx-auto px-6 pt-20 pb-12 text-center">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[rgba(74,222,128,0.10)] border border-[rgba(74,222,128,0.30)] mb-6">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="label-caps text-gold mb-3">Submission received</p>
      <h1 className="text-3xl md:text-4xl font-semibold text-cream mb-4 text-balance leading-snug">
        Thank you. The index is better because of you.
      </h1>
      <p className="text-sm text-cream-60 leading-relaxed max-w-md mx-auto mb-8">
        Your record joins the dataset within 48 hours. From now on, every
        professional who compares their salary against your level, industry,
        or function is partly benchmarking against your contribution.
      </p>

      {/* Share: the single most valuable action right now */}
      <div className="surface-card text-left space-y-5">
        <div>
          <p className="text-sm font-semibold text-cream mb-1">
            Now: bring one more person.
          </p>
          <p className="text-xs text-cream-60 leading-relaxed">
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
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-[rgba(200,150,42,0.15)] text-sm font-medium transition-all hover:border-[rgba(200,150,42,0.30)] min-h-[44px]"
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
          className="bg-gold hover:bg-gold-hover text-bg-primary font-semibold text-sm tracking-[0.05em] px-6 py-3.5 rounded-md transition-colors min-h-[44px] inline-flex items-center justify-center"
        >
          See where you stand
        </Link>
        <Link
          href="/insights"
          className="border border-[rgba(200,150,42,0.25)] text-gold hover:bg-[rgba(200,150,42,0.08)] font-medium text-sm px-5 py-3 rounded-md transition-colors min-h-[44px] inline-flex items-center justify-center"
        >
          What the data reveals
        </Link>
      </div>
    </div>
  );
}
