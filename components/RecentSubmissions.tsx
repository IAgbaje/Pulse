"use client";

import { getCurrencySymbol, type CompensationRecord } from "@/lib/data";
import SourceBadge from "@/components/SourceBadge";

interface RecentSubmissionsProps {
  data: CompensationRecord[];
}

export default function RecentSubmissions({ data }: RecentSubmissionsProps) {
  if (!data.length) return (
    <div className="surface-card text-center py-12">
      <p className="text-cream-40 text-sm">No submissions in this filter.</p>
    </div>
  );

  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full data-table min-w-[640px]">
          <thead>
            <tr>
              <th>Function</th>
              <th>Level</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Gross (Monthly)</th>
              <th>Net (Monthly)</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const sym = getCurrencySymbol(r.currency);
              const grossDisplay =
                r.monthly_gross != null
                  ? `${sym}${r.monthly_gross.toLocaleString()}`
                  : r.currency !== "NGN"
                  ? `${sym}–`
                  : "–";
              const netDisplay =
                r.monthly_net != null ? `${sym}${r.monthly_net.toLocaleString()}` : "–";
              const isDiaspora = r.currency !== "NGN";

              return (
                <tr key={r.id} className={isDiaspora ? "opacity-80" : ""}>
                  <td className="text-cream-60 whitespace-nowrap">
                    {r.function.replace("Sales & Business Development", "Sales & BD")}
                  </td>
                  <td className="text-cream-60 whitespace-nowrap">
                    {r.role_level.split(" (")[0]}
                  </td>
                  <td className="text-cream-60">{r.industry ?? "–"}</td>
                  <td className="text-cream-60">{r.location ?? "–"}</td>
                  <td className="salary-cell">{grossDisplay}</td>
                  <td className="text-cream-60">{netDisplay}</td>
                  <td>
                    <SourceBadge source={r.source} label={r.source_label} />
                    {isDiaspora && (
                      <span className="ml-1 text-[9px] text-cream-30 uppercase tracking-wider">
                        {r.currency}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
