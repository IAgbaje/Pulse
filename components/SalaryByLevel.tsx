"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { InsightSet, formatCurrency } from "@/lib/data";

interface SalaryByLevelProps {
  insights: InsightSet;
}

const LEVEL_SHORT: Record<string, string> = {
  "Junior (0-2 yrs)": "Junior",
  "Mid-level (2-4 yrs)": "Mid-level",
  "Senior (4-8 yrs)": "Senior",
  "Lead/Staff (6-10 yrs)": "Lead/Staff",
  Director: "Director",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#0A2614",
          border: "1px solid rgba(200,150,42,0.3)",
          borderRadius: "6px",
          padding: "12px 16px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-karla)",
            fontWeight: 700,
            fontSize: "12px",
            color: "rgba(240,235,225,0.5)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "24px",
            color: "#C8962A",
            letterSpacing: "0.04em",
          }}
        >
          {formatCurrency(payload[0].value)}
        </p>
        <p
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "12px",
            color: "rgba(240,235,225,0.5)",
          }}
        >
          Median monthly gross
        </p>
      </div>
    );
  }
  return null;
};

export default function SalaryByLevel({ insights }: SalaryByLevelProps) {
  const chartData = insights.byLevel.map((l) => ({
    name: LEVEL_SHORT[l.level] || l.level,
    fullName: l.level,
    median: l.median,
    p25: l.p25,
    p75: l.p75,
    count: l.count,
  }));

  return (
    <section
      id="salary"
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
          Compensation by level
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
          What do Nigerian tech professionals earn?
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
          Monthly gross salary by role level. Based on community-contributed data.
        </p>

        {/* Bar chart */}
        <div
          className="card p-6 mb-8"
          style={{
            background: "rgba(200,150,42,0.04)",
            border: "1px solid rgba(200,150,42,0.12)",
            borderRadius: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 80, left: 16, bottom: 8 }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="rgba(240,235,225,0.08)"
              />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCurrency(v)}
                tick={{
                  fill: "rgba(240,235,225,0.4)",
                  fontSize: 11,
                  fontFamily: "var(--font-karla)",
                }}
                axisLine={{ stroke: "rgba(240,235,225,0.08)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={72}
                tick={{
                  fill: "rgba(240,235,225,0.6)",
                  fontSize: 12,
                  fontFamily: "var(--font-karla)",
                  fontWeight: 600,
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200,150,42,0.06)" }} />
              <Bar dataKey="median" radius={[0, 4, 4, 0]} maxBarSize={32}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === chartData.length - 1
                        ? "#C8962A"
                        : index === chartData.length - 2
                        ? "rgba(200,150,42,0.7)"
                        : "rgba(200,150,42,0.45)"
                    }
                  />
                ))}
                <LabelList
                  dataKey="median"
                  position="right"
                  formatter={(v: number) => formatCurrency(v)}
                  style={{
                    fill: "#C8962A",
                    fontSize: "12px",
                    fontFamily: "var(--font-karla)",
                    fontWeight: 700,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Percentile cards */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 min-w-max pb-2">
            {chartData.map((level) => (
              <div
                key={level.name}
                className="flex flex-col gap-2 min-w-[160px]"
                style={{
                  background: "rgba(200,150,42,0.04)",
                  border: "1px solid rgba(200,150,42,0.12)",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontWeight: 700,
                    fontSize: "10px",
                    letterSpacing: "0.15em",
                    color: "rgba(240,235,225,0.4)",
                    marginBottom: 4,
                  }}
                >
                  {level.name}
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    { label: "25th pct", value: level.p25 },
                    { label: "Median", value: level.median },
                    { label: "75th pct", value: level.p75 },
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center gap-4">
                      <span
                        style={{
                          fontFamily: "var(--font-karla)",
                          fontSize: "11px",
                          color: "rgba(240,235,225,0.4)",
                        }}
                      >
                        {stat.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-karla)",
                          fontWeight: 700,
                          fontSize: "12px",
                          color: stat.label === "Median" ? "#C8962A" : "#F0EBE1",
                        }}
                      >
                        {stat.value > 0 ? formatCurrency(stat.value) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-karla)",
                    fontSize: "10px",
                    color: "rgba(240,235,225,0.26)",
                    marginTop: 4,
                  }}
                >
                  n={level.count}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Source label */}
        <div className="flex justify-end mt-4">
          <p
            style={{
              fontFamily: "var(--font-karla)",
              fontSize: "11px",
              color: "rgba(240,235,225,0.26)",
              letterSpacing: "0.05em",
            }}
          >
            Source: Community Data (2023) | n={insights.totalRecords}
          </p>
        </div>
      </div>
    </section>
  );
}
