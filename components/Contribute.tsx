"use client";

declare global {
  interface Window {
    Tally?: { openPopup: (formId: string, options?: Record<string, unknown>) => void };
  }
}

const TRUST_CARDS = [
  {
    icon: "⏱",
    headline: "3–4 minutes",
    body: "A handful of questions. No lengthy forms, no sign-up required.",
  },
  {
    icon: "🔒",
    headline: "Fully anonymous",
    body: "Zero names, zero company names, zero trace back to you.",
  },
  {
    icon: "📊",
    headline: "Open data",
    body: "Your entry directly moves the index everyone else reads.",
  },
];

export default function Contribute() {
  const handleOpen = () => {
    if (window.Tally) {
      window.Tally.openPopup("44PlyB", {
        layout: "modal",
        width: 720,
        hideTitle: true,
        alignLeft: true,
      });
    }
  };

  return (
    <section
      id="contribute"
      className="py-20"
      style={{ borderTop: "1px solid rgba(200,150,42,0.12)" }}
    >
      <div className="section-container">
        {/* Label */}
        <p
          className="uppercase mb-2"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "11px",
            letterSpacing: "0.2em",
            color: "rgba(240,235,225,0.26)",
          }}
        >
          Contribute
        </p>

        {/* Heading */}
        <h2
          className="mb-3 max-w-2xl"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 32px)",
            color: "#F0EBE1",
          }}
        >
          Your four minutes will change someone&apos;s next negotiation
        </h2>

        {/* Subtext */}
        <p
          className="mb-10 max-w-xl"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 400,
            fontSize: "15px",
            color: "rgba(240,235,225,0.46)",
            lineHeight: 1.7,
          }}
        >
          Every submission makes the index more useful for the professional who comes after you.
        </p>

        {/* Trust cards */}
        <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
          {TRUST_CARDS.map((card) => (
            <div
              key={card.headline}
              className="rounded-lg p-5"
              style={{
                border: "1px solid rgba(200,150,42,0.18)",
                background: "rgba(200,150,42,0.04)",
              }}
            >
              <span style={{ fontSize: "20px" }}>{card.icon}</span>
              <p
                className="mt-3 mb-1"
                style={{
                  fontFamily: "var(--font-karla)",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#C8962A",
                }}
              >
                {card.headline}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-karla)",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "rgba(240,235,225,0.46)",
                  lineHeight: 1.6,
                }}
              >
                {card.body}
              </p>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={handleOpen}
          className="inline-flex items-center gap-2 rounded-lg px-8 py-4 transition-opacity hover:opacity-90 active:opacity-75"
          style={{
            background: "#C8962A",
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "15px",
            color: "#0B1120",
            letterSpacing: "0.02em",
            cursor: "pointer",
            border: "none",
          }}
        >
          Submit your compensation
          <span style={{ fontSize: "16px" }}>→</span>
        </button>

        {/* Social proof */}
        <p
          className="mt-5"
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "13px",
            color: "rgba(240,235,225,0.28)",
            letterSpacing: "0.03em",
          }}
        >
          Already 104 submissions · Updated as new data arrives
        </p>
      </div>
    </section>
  );
}
