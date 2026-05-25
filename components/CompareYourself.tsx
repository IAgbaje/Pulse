"use client";
import { useState } from "react";
import {
  CompensationRecord,
  getByLevel,
  getByIndustry,
  getMedian,
  getPercentile,
  getPercentileRank,
  formatCurrency,
} from "@/lib/data";

const LEVELS = [
  "Junior (0-2 yrs)",
  "Mid-level (2-4 yrs)",
  "Senior (4-8 yrs)",
  "Lead/Staff (6-10 yrs)",
  "Director",
];

const INDUSTRIES = ["All", "Fintech", "SaaS", "Healthtech", "Edtech", "Logistics", "Other"];

interface CompareYourselfProps {
  data: CompensationRecord[];
}

interface CompareResult {
  percentileRank: number;
  median: number;
  p25: number;
  p75: number;
  count: number;
  salary: number;
  level: string;
  industry: string;
}

function getValidGross(records: CompensationRecord[]): number[] {
  return records
    .map((r) => r.monthly_gross)
    .filter((v): v is number => v !== null && v > 0 && v < 50_000_000);
}

export default function CompareYourself({ data }: CompareYourselfProps) {
  const [level, setLevel] = useState("");
  const [industry, setIndustry] = useState("All");
  const [salary, setSalary] = useState("");
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState("");

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    if (raw === "") { setSalary(""); return; }
    setSalary(parseInt(raw, 10).toLocaleString("en-NG"));
  };

  const handleCompare = () => {
    setError("");
    setResult(null);

    if (!level) {
      setError("Please select your role level.");
      return;
    }
    const salaryNum = parseFloat(salary.replace(/,/g, ""));
    if (!salaryNum || isNaN(salaryNum) || salaryNum <= 0) {
      setError("Please enter a valid salary.");
      return;
    }

    let filtered = getByLevel(data, level);
    if (industry !== "All") {
      filtered = getByIndustry(filtered, industry);
    }

    const values = getValidGross(filtered);

    if (values.length < 5) {
      setResult({
        percentileRank: -1,
        median: 0,
        p25: 0,
        p75: 0,
        count: values.length,
        salary: salaryNum,
        level,
        industry,
      });
      return;
    }

    setResult({
      percentileRank: getPercentileRank(values, salaryNum),
      median: getMedian(values),
      p25: getPercentile(values, 25),
      p75: getPercentile(values, 75),
      count: values.length,
      salary: salaryNum,
      level,
      industry,
    });
  };

  const levelShort = (l: string) => l.split(" (")[0];

  return (
    <section
      id="compare"
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
          Salary comparison
        </p>
        <h2
          className="mb-3"
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "clamp(22px, 4vw, 32px)",
            color: "#F0EBE1",
          }}
        >
          How do you compare?
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
          See where your salary sits relative to the market
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div
            className="flex flex-col gap-5 p-6"
            style={{
              background: "rgba(200,150,42,0.04)",
              border: "1px solid rgba(200,150,42,0.14)",
              borderRadius: "8px",
            }}
          >
            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: "var(--font-karla)",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(240,235,225,0.5)",
                }}
              >
                Role level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 transition-colors focus:outline-none"
                style={{
                  background: "rgba(8,28,15,0.8)",
                  border: "1px solid rgba(200,150,42,0.2)",
                  borderRadius: "6px",
                  color: level ? "#F0EBE1" : "rgba(240,235,225,0.3)",
                  fontFamily: "var(--font-karla)",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled>
                  Select your level
                </option>
                {LEVELS.map((l) => (
                  <option key={l} value={l} style={{ background: "#0A2614", color: "#F0EBE1" }}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: "var(--font-karla)",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(240,235,225,0.5)",
                }}
              >
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 transition-colors focus:outline-none"
                style={{
                  background: "rgba(8,28,15,0.8)",
                  border: "1px solid rgba(200,150,42,0.2)",
                  borderRadius: "6px",
                  color: "#F0EBE1",
                  fontFamily: "var(--font-karla)",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind} style={{ background: "#0A2614", color: "#F0EBE1" }}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                style={{
                  fontFamily: "var(--font-karla)",
                  fontWeight: 700,
                  fontSize: "11px",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "rgba(240,235,225,0.5)",
                }}
              >
                Monthly gross salary (₦)
              </label>
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none select-none"
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "14px",
                    color: "rgba(240,235,225,0.4)",
                  }}
                >
                  ₦
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={salary}
                  onChange={handleSalaryChange}
                  placeholder="e.g. 600,000"
                  className="w-full pl-7 pr-4 py-3 focus:outline-none transition-colors"
                  style={{
                    background: "rgba(8,28,15,0.8)",
                    border: "1px solid rgba(200,150,42,0.2)",
                    borderRadius: "6px",
                    color: "#F0EBE1",
                    fontFamily: "var(--font-karla)",
                    fontSize: "14px",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleCompare()}
                />
              </div>
            </div>

            {error && (
              <p style={{ fontFamily: "var(--font-karla)", fontSize: "13px", color: "#E57373" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleCompare}
              className="px-6 py-3 font-bold tracking-widest uppercase transition-all duration-200 hover:brightness-110 active:scale-95"
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
              Compare
            </button>
          </div>

          {/* Result */}
          <div
            className="flex flex-col justify-center p-6"
            style={{
              background: "rgba(200,150,42,0.04)",
              border: "1px solid rgba(200,150,42,0.14)",
              borderRadius: "8px",
              minHeight: "280px",
            }}
          >
            {!result ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "rgba(200,150,42,0.08)",
                    border: "1px solid rgba(200,150,42,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L10 18M2 10L18 10" stroke="#C8962A" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "14px",
                    color: "rgba(240,235,225,0.3)",
                    lineHeight: 1.6,
                  }}
                >
                  Enter your details and click Compare to see where you stand in the market.
                </p>
              </div>
            ) : result.percentileRank === -1 ? (
              <div className="flex flex-col gap-4">
                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "#F0EBE1",
                    lineHeight: 1.5,
                  }}
                >
                  Not enough data for this segment yet.
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "14px",
                    color: "rgba(240,235,225,0.5)",
                    lineHeight: 1.7,
                  }}
                >
                  We only have {result.count} data point{result.count !== 1 ? "s" : ""} for{" "}
                  {levelShort(result.level)}{" "}
                  {result.industry !== "All" ? `in ${result.industry}` : "across all industries"}.
                  Help us fix that by contributing your numbers.
                </p>
                <button
                  onClick={() =>
                    document.querySelector("#contribute")?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="px-5 py-2.5 text-sm font-bold tracking-wider uppercase transition-all hover:brightness-110"
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "12px",
                    letterSpacing: "0.12em",
                    background: "#C8962A",
                    color: "#0B1120",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    alignSelf: "flex-start",
                  }}
                >
                  Add your numbers
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {/* Percentile headline */}
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: "56px",
                      color: result.percentileRank >= 50 ? "#4CAF50" : "#E57373",
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {result.percentileRank}th
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-karla)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "rgba(240,235,225,0.5)",
                      letterSpacing: "0.05em",
                    }}
                  >
                    percentile
                  </p>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "14px",
                    color: "rgba(240,235,225,0.7)",
                    lineHeight: 1.7,
                  }}
                >
                  You earn{" "}
                  <strong style={{ color: "#F0EBE1" }}>
                    {result.percentileRank >= 50 ? "more" : "less"}
                  </strong>{" "}
                  than{" "}
                  <strong style={{ color: "#C8962A" }}>
                    {result.percentileRank >= 50 ? result.percentileRank : 100 - result.percentileRank}%
                  </strong>{" "}
                  of {levelShort(result.level)} professionals{" "}
                  {result.industry !== "All" ? `in ${result.industry}` : "in the dataset"}.
                </p>

                {/* Gauge bar */}
                <div className="flex flex-col gap-2">
                  <div
                    className="relative h-3 rounded-full overflow-hidden"
                    style={{ background: "rgba(240,235,225,0.08)" }}
                  >
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${result.percentileRank}%`,
                        background:
                          result.percentileRank >= 50
                            ? "linear-gradient(to right, rgba(200,150,42,0.4), #4CAF50)"
                            : "linear-gradient(to right, rgba(200,150,42,0.3), #E57373)",
                      }}
                    />
                    {/* Median marker */}
                    <div
                      className="absolute top-0 h-full w-0.5"
                      style={{
                        left: "50%",
                        background: "#C8962A",
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span
                      style={{
                        fontFamily: "var(--font-karla)",
                        fontSize: "10px",
                        color: "rgba(240,235,225,0.3)",
                      }}
                    >
                      0th
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-karla)",
                        fontSize: "10px",
                        color: "rgba(240,235,225,0.3)",
                      }}
                    >
                      50th (median)
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-karla)",
                        fontSize: "10px",
                        color: "rgba(240,235,225,0.3)",
                      }}
                    >
                      100th
                    </span>
                  </div>
                </div>

                {/* Market context */}
                <div
                  className="p-4"
                  style={{
                    background: "rgba(8,28,15,0.6)",
                    border: `1px solid ${result.percentileRank >= 50 ? "rgba(76,175,80,0.2)" : "rgba(229,115,115,0.2)"}`,
                    borderRadius: "6px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-karla)",
                      fontSize: "13px",
                      color: "rgba(240,235,225,0.7)",
                      lineHeight: 1.7,
                    }}
                  >
                    {result.percentileRank < 50 ? (
                      <>
                        Based on this data, the market rate for your level is{" "}
                        <strong style={{ color: "#C8962A" }}>{formatCurrency(result.median)}</strong>.
                        You may be underpaid.
                      </>
                    ) : (
                      <>
                        You&apos;re earning above the median for your level. You&apos;re in a strong position.
                        Market median: <strong style={{ color: "#C8962A" }}>{formatCurrency(result.median)}</strong>.
                      </>
                    )}
                  </p>
                </div>

                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "12px",
                    color: "rgba(240,235,225,0.3)",
                  }}
                >
                  Based on {result.count} data points
                </p>

                <button
                  onClick={() =>
                    document.querySelector("#contribute")?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "12px",
                    color: "#C8962A",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: 0,
                    textDecoration: "underline",
                    textDecorationColor: "rgba(200,150,42,0.3)",
                  }}
                >
                  Want more granular data? Add your numbers to make the index better for everyone.
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
