const insights = [
  {
    stat: "82%",
    title: "Negotiation Premium",
    body: "PMs who negotiated their salary earn a median of ₦820,000 vs ₦450,000 for those who didn't. The single most actionable finding in the dataset.",
  },
  {
    stat: "3.6x",
    title: "Junior to Senior Multiplier",
    body: "Moving from 0–2 years to 4–8 years of experience nearly quadruples median compensation. The biggest salary jump happens between mid-level and senior.",
  },
  {
    stat: "84%",
    title: "Take-home Ratio",
    body: "The average tech professional keeps 84 kobo of every naira earned. Use this to convert between gross offers and what actually hits your account.",
  },
  {
    stat: "51%",
    title: "Fintech Dominance",
    body: "More than half of all data points come from fintech. The industry pays a median of ₦600,000 gross monthly and remains the largest employer of tech talent in Nigeria.",
  },
  {
    stat: "45%",
    title: "Negotiated Their Salary",
    body: "Fewer than half of professionals negotiated their compensation. Those who did earned significantly more. The data is clear: always negotiate.",
  },
  {
    stat: "+7%",
    title: "Women Earn More",
    body: "Female PMs in the dataset earn a median of ₦600,000 vs ₦560,000 for males. A counterintuitive finding based on 2023 data that needs more data points to confirm.",
  },
];

export default function Insights() {
  return (
    <section
      id="insights"
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
          Key findings
        </p>
        <h2
          className="mb-10"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 32px)",
            color: "#F0EBE1",
          }}
        >
          What the data reveals
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {insights.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-3 p-6 transition-all duration-200 hover:border-[rgba(200,150,42,0.3)]"
              style={{
                background: "rgba(200,150,42,0.04)",
                border: "1px solid rgba(200,150,42,0.14)",
                borderRadius: "8px",
              }}
            >
              <div className="flex items-start gap-4">
                <span
                  className="leading-none flex-shrink-0"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    fontSize: "clamp(48px, 6vw, 64px)",
                    color: "#C8962A",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {item.stat}
                </span>
                <div className="flex flex-col gap-1 pt-2">
                  <p
                    style={{
                      fontFamily: "var(--font-karla)",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#F0EBE1",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-karla)",
                      fontWeight: 400,
                      fontSize: "14px",
                      color: "rgba(240,235,225,0.6)",
                      lineHeight: 1.7,
                    }}
                  >
                    {item.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
