interface MethodologyProps {
  totalRecords: number;
}

const points = [
  "Pulse combines community-contributed compensation data from Nigerian tech professionals.",
  (n: number) =>
    `The 2023 dataset contains ${n} data points collected through community surveys across Product Management roles. This serves as historical benchmark data.`,
  "New data is collected through the Pulse form above and will be added to the index as submissions grow.",
  "All statistics use medians (not averages) to reduce the impact of outliers. Segments with fewer than 5 data points are flagged.",
  "No individual response is ever published. Only aggregated statistics are shown.",
];

export default function Methodology({ totalRecords }: MethodologyProps) {
  return (
    <section
      id="methodology"
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
          Transparency
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
          How this works
        </h2>

        <div
          className="max-w-2xl flex flex-col gap-0"
          style={{
            background: "rgba(200,150,42,0.04)",
            border: "1px solid rgba(200,150,42,0.12)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {points.map((point, i) => {
            const text = typeof point === "function" ? point(totalRecords) : point;
            return (
              <div
                key={i}
                className="flex gap-4 p-5"
                style={{
                  borderBottom:
                    i < points.length - 1 ? "1px solid rgba(200,150,42,0.1)" : "none",
                }}
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full mt-0.5"
                  style={{
                    background: "rgba(200,150,42,0.12)",
                    border: "1px solid rgba(200,150,42,0.2)",
                    fontFamily: "var(--font-bebas)",
                    fontSize: "14px",
                    color: "#C8962A",
                    letterSpacing: "0.04em",
                    lineHeight: 1,
                  }}
                >
                  {i + 1}
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontWeight: 400,
                    fontSize: "15px",
                    color: "rgba(240,235,225,0.65)",
                    lineHeight: 1.7,
                  }}
                >
                  {text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
