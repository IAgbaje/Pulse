"use client";
import { useEffect, useRef, useState } from "react";

export default function Contribute() {
  const sectionRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="contribute"
      ref={sectionRef}
      className="py-20"
      style={{ borderTop: "1px solid rgba(200,150,42,0.12)" }}
    >
      <div className="section-container">
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

        {/* Tally embed */}
        <div
          className="w-full rounded-lg overflow-hidden"
          style={{
            border: "1px solid rgba(200,150,42,0.14)",
            minHeight: "800px",
            background: "rgba(200,150,42,0.02)",
          }}
        >
          {loaded && (
            <iframe
              data-tally-src="https://tally.so/embed/YOUR_FORM_ID?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
              loading="lazy"
              width="100%"
              height="800"
              frameBorder={0}
              marginHeight={0}
              marginWidth={0}
              title="Pulse Compensation Index"
              style={{ display: "block" }}
            />
          )}
          {!loaded && (
            <div
              className="flex items-center justify-center"
              style={{ height: "800px" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-karla)",
                  fontSize: "14px",
                  color: "rgba(240,235,225,0.3)",
                }}
              >
                Loading form...
              </p>
            </div>
          )}
        </div>

        <p
          className="mt-6 text-center"
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "13px",
            color: "rgba(240,235,225,0.3)",
            letterSpacing: "0.03em",
          }}
        >
          100% anonymous. No names, no company names, no identifying information.
        </p>
      </div>
    </section>
  );
}
