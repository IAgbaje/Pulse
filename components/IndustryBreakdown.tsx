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

interface IndustryBreakdownProps {
  insights: InsightSet;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
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
          {formatCurrency(entry.value)}
        </p>
        <p
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "12px",
            color: "rgba(240,235,225,0.5)",
          }}
        >
          n={entry.payload.count} submissions
        </p>
      </div>
    );
  }
  return null;
};

interface CustomLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
  count?: number;
}

const CustomLabel = ({ x = 0, y = 0, width = 0, value = 0, count }: CustomLabelProps) => {
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="#C8962A"
      textAnchor="middle"
      style={{
        fontFamily: "var(--font-karla)",
        fontWeight: 700,
        fontSize: "11px",
      }}
    >
      {formatCurrency(value)} (n={count})
    </text>
  );
};

export default function IndustryBreakdown({ insights }: IndustryBreakdownProps) {
  const chartData = insights.byIndustry.map((i) => ({
    name: i.industry,
    median: i.median,
    count: i.count,
  }));

  return (
    <section
      id="industry"
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
          Industry compensation
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
          Which industries pay the most?
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
          Median monthly compensation by industry
        </p>

        <div
          className="card p-6 mb-4"
          style={{
            background: "rgba(200,150,42,0.04)",
            border: "1px solid rgba(200,150,42,0.12)",
            borderRadius: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={chartData}
              margin={{ top: 32, right: 16, left: 16, bottom: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="rgba(240,235,225,0.08)"
              />
              <XAxis
                dataKey="name"
                tick={{
                  fill: "rgba(240,235,225,0.5)",
                  fontSize: 12,
                  fontFamily: "var(--font-karla)",
                  fontWeight: 600,
                }}
                axisLine={{ stroke: "rgba(240,235,225,0.08)" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCurrency(v)}
                tick={{
                  fill: "rgba(240,235,225,0.4)",
                  fontSize: 11,
                  fontFamily: "var(--font-karla)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(200,150,42,0.06)" }} />
              <Bar dataKey="median" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index === 0
                        ? "#C8962A"
                        : `rgba(200,150,42,${0.65 - index * 0.08})`
                    }
                  />
                ))}
                <LabelList
                  content={(props) => (
                    <CustomLabel
                      {...props}
                      count={chartData[props.index as number]?.count}
                    />
                  )}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p
          style={{
            fontFamily: "var(--font-karla)",
            fontSize: "12px",
            color: "rgba(240,235,225,0.26)",
            fontStyle: "italic",
          }}
        >
          Industries with fewer than 4 submissions are grouped under &apos;Other&apos; for statistical reliability
        </p>
      </div>
    </section>
  );
}
