import Badge, { type BadgeVariant } from "@/components/ui/Badge";

interface SourceBadgeProps {
  source: string;
  label: string;
}

// Thin adapter over ui/Badge — keeps the pre-migration {source, label} call
// contract (see components/RecentSubmissions.tsx) while mapping onto the
// design system's data-source badge variants.
function variantForSource(source: string): BadgeVariant {
  if (source === "pulse_2026") return "pulse";
  if (source.startsWith("community")) return "community";
  return "historical";
}

export default function SourceBadge({ source, label }: SourceBadgeProps) {
  return (
    <Badge variant={variantForSource(source)} dot={false}>
      {label}
    </Badge>
  );
}
