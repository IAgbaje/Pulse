"use client";
import { InsightSet, formatCurrency } from "@/lib/data";
import StatCard from "./StatCard";

interface HeroProps {
  insights: InsightSet;
}

export default function Hero({ insights }: HeroProps) {
  const scroll = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-16 pb-16"
      style={{ background: "#0B1120" }}
    >
      {/* Background subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(200,150,42,0.08) 0%, transparent 60%)",
        }}
      />

      <div className="section-container relative z-10 flex flex-col items-center text-center w-full">
        {/* PULSE title */}
        <h1
          className="leading-none mb-0"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(64px, 12vw, 96px)",
            letterSpacing: "0.06em",
            color: "#F0EBE1",
          }}
        >
          PULSE
        </h1>

        {/* EKG SVG */}
        <div className="w-full max-w-xl mx-auto my-4" style={{ height: "48px" }}>
          <svg
            viewBox="0 0 600 48"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            height="48"
            fill="none"
          >
            <path
              className="ekg-path"
              d="M0,24 L80,24 L100,24 L120,4 L140,44 L155,10 L170,38 L185,18 L200,24 L220,24 L260,24 L280,24 L300,8 L315,40 L330,14 L345,36 L358,20 L370,24 L400,24 L440,24 L460,24 L480,6 L495,42 L510,12 L525,36 L538,22 L550,24 L600,24"
              stroke="#C8962A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Tagline */}
        <p
          className="mb-3 max-w-2xl"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 300,
            fontSize: "clamp(18px, 3vw, 28px)",
            color: "#F0EBE1",
            lineHeight: 1.4,
          }}
        >
          Nigerian tech talent has a voice. It&apos;s time it had data.
        </p>

        {/* Subtitle */}
        <p
          className="mb-10 max-w-xl"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 400,
            fontSize: "clamp(14px, 2vw, 16px)",
            color: "rgba(240,235,225,0.46)",
            lineHeight: 1.7,
          }}
        >
          An anonymous compensation index for tech and business professionals in Nigeria
        </p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
          <StatCard
            value={`${insights.totalRecords}+`}
            label="Data points"
          />
          <StatCard
            value={formatCurrency(insights.medianGross)}
            label="Median monthly gross"
          />
          <StatCard
            value="82%"
            label="Negotiation premium"
          />
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-12">
          <button
            onClick={() => scroll("#salary")}
            className="px-8 py-3 font-bold tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{
              fontFamily: "var(--font-karla)",
              fontSize: "13px",
              letterSpacing: "0.15em",
              background: "#C8962A",
              color: "#0B1120",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Explore the data
          </button>
          <button
            onClick={() => scroll("#contribute")}
            className="px-8 py-3 font-bold tracking-widest uppercase transition-all duration-200 hover:bg-[rgba(200,150,42,0.12)]"
            style={{
              fontFamily: "var(--font-karla)",
              fontSize: "13px",
              letterSpacing: "0.15em",
              background: "transparent",
              color: "#C8962A",
              border: "1px solid rgba(200,150,42,0.4)",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add your numbers
          </button>
        </div>

        {/* Bottom note */}
        <p
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "12px",
            color: "rgba(240,235,225,0.26)",
            letterSpacing: "0.05em",
          }}
        >
          Built for the community. 100% anonymous.
        </p>
      </div>
    </section>
  );
}
