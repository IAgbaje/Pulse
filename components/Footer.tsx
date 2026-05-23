"use client";

const scrollTo = (id: string) => {
  if (typeof window !== "undefined") {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  }
};

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{
        borderTop: "1px solid rgba(200,150,42,0.22)",
        background: "rgba(8,28,15,0.6)",
      }}
    >
      <div className="section-container">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <span
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "32px",
                color: "#C8962A",
                letterSpacing: "0.1em",
                lineHeight: 1,
              }}
            >
              PULSE
            </span>
            <p
              style={{
                fontFamily: "var(--font-karla)",
                fontWeight: 400,
                fontSize: "14px",
                color: "rgba(240,235,225,0.4)",
                lineHeight: 1.5,
              }}
            >
              An anonymous compensation index for Nigerian tech professionals
            </p>
            <p
              style={{
                fontFamily: "var(--font-karla)",
                fontWeight: 400,
                fontSize: "13px",
                color: "rgba(240,235,225,0.26)",
              }}
            >
              Built for the community
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex gap-6">
              {[
                { label: "Contribute", href: "#contribute" },
                { label: "Methodology", href: "#methodology" },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href)}
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontWeight: 700,
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(240,235,225,0.46)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "#C8962A")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "rgba(240,235,225,0.46)")
                  }
                >
                  {link.label}
                </button>
              ))}
            </div>
            <p
              style={{
                fontFamily: "var(--font-karla)",
                fontWeight: 700,
                fontSize: "13px",
                color: "rgba(240,235,225,0.46)",
              }}
            >
              Created by Ibraheem Agbaje
            </p>
            <p
              style={{
                fontFamily: "var(--font-karla)",
                fontSize: "11px",
                color: "rgba(240,235,225,0.2)",
                letterSpacing: "0.05em",
              }}
            >
              Data last updated: May 2026
            </p>
          </div>
        </div>

        <div
          className="mt-8 pt-6"
          style={{ borderTop: "1px solid rgba(200,150,42,0.1)" }}
        >
          <p
            className="text-center"
            style={{
              fontFamily: "var(--font-karla)",
              fontSize: "11px",
              color: "rgba(240,235,225,0.18)",
              letterSpacing: "0.1em",
            }}
          >
            © 2026 Pulse. No individual data is ever published.
          </p>
        </div>
      </div>
    </footer>
  );
}
