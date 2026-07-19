"use client";

import { formatCurrency, getCurrencySymbol, type CompensationRecord } from "@/lib/data";
import SourceBadge from "@/components/SourceBadge";
import Badge from "@/components/ui/Badge";

interface RecentSubmissionsProps {
  data: CompensationRecord[];
}

const HEADERS = ["Role", "Level", "Company", "Industry", "Location", "Gross (Monthly)", "Net (Monthly)", "Source"];
const RIGHT_ALIGNED = new Set(["Gross (Monthly)", "Net (Monthly)"]);

/* Withheld fields render an em dash in the hint tier — decorative placeholder,
   never blank (DataTable spec). */
function Withheld() {
  return <span className="text-content-hint">—</span>;
}

/* Full figure for tooltips; table cells show the compact form (DS numeric
   rule: compact in tables, full only in tooltips/review). */
function fullFigure(value: number | null, currency: string): string | undefined {
  if (value == null) return undefined;
  return `${getCurrencySymbol(currency)}${value.toLocaleString()}`;
}

export default function RecentSubmissions({ data }: RecentSubmissionsProps) {
  if (!data.length) return (
    <div className="surface-card py-12 text-center">
      <p className="text-sm text-content-tertiary">No submissions in this filter.</p>
    </div>
  );

  return (
    <div className="surface-card overflow-hidden p-0">
      {/* Desktop: full table, compact figures — fits without horizontal scroll */}
      <div className="hidden lg:block">
        <table className="data-table w-full">
          <thead>
            <tr>
              {HEADERS.map((h) => (
                <th key={h} className={RIGHT_ALIGNED.has(h) ? "text-right" : undefined}>
                  <span className="text-content-tertiary">{h}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const isDiaspora = r.currency !== "NGN";
              return (
                <tr key={r.id} className={isDiaspora ? "opacity-80" : ""}>
                  <td className="max-w-[220px] text-content-secondary" title={r.function}>
                    {r.job_title || r.function.replace("Sales & Business Development", "Sales & BD")}
                  </td>
                  <td className="whitespace-nowrap text-content-secondary">
                    {r.role_level.split(" (")[0]}
                  </td>
                  <td className="whitespace-nowrap text-content-secondary">{r.company_name ?? <Withheld />}</td>
                  <td className="text-content-secondary">{r.industry ?? <Withheld />}</td>
                  <td className="text-content-secondary">{r.location ?? <Withheld />}</td>
                  <td className="salary-cell text-right" title={fullFigure(r.monthly_gross, r.currency)}>
                    {r.monthly_gross != null ? formatCurrency(r.monthly_gross, r.currency) : <Withheld />}
                  </td>
                  <td className="num text-content-secondary text-right" title={fullFigure(r.monthly_net, r.currency)}>
                    {r.monthly_net != null ? formatCurrency(r.monthly_net, r.currency) : <Withheld />}
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5">
                      <SourceBadge source={r.source} label={r.source_label} />
                      {isDiaspora && (
                        <Badge variant="usd" dot={false}>{r.currency}</Badge>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile: card collapse per DataTable spec — role + gross on line 1,
          meta on line 2, badges on line 3. No horizontal scroll. */}
      <ul className="divide-y divide-[var(--border-subtle)] lg:hidden">
        {data.map((r) => {
          const isDiaspora = r.currency !== "NGN";
          const meta = [
            r.role_level.split(" (")[0],
            r.company_name,
            r.industry,
            r.location,
          ].filter(Boolean).join(" · ");
          return (
            <li key={r.id} className={`px-4 py-3 ${isDiaspora ? "opacity-80" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-sm text-content-primary" title={r.function}>
                  {r.job_title || r.function.replace("Sales & Business Development", "Sales & BD")}
                </p>
                <p
                  className="num flex-shrink-0 text-sm font-medium text-content-accent"
                  title={fullFigure(r.monthly_gross, r.currency)}
                >
                  {r.monthly_gross != null ? formatCurrency(r.monthly_gross, r.currency) : "—"}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-content-secondary">{meta}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <SourceBadge source={r.source} label={r.source_label} />
                {isDiaspora && <Badge variant="usd" dot={false}>{r.currency}</Badge>}
                {r.monthly_net != null && (
                  <span className="num ml-auto text-xs text-content-tertiary" title={fullFigure(r.monthly_net, r.currency)}>
                    Net {formatCurrency(r.monthly_net, r.currency)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
