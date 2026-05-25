interface SourceBadgeProps {
  source: string;
  label: string;
}

export default function SourceBadge({ source, label }: SourceBadgeProps) {
  const isPulse = source === "pulse_2026";
  return (
    <span
      className={`inline-block text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-0.5 rounded-full ${
        isPulse
          ? "bg-gold text-bg-primary"
          : "border border-[rgba(200,150,42,0.35)] text-gold/70"
      }`}
    >
      {label}
    </span>
  );
}
