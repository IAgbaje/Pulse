import type { HTMLAttributes, ReactNode } from "react";

export type BadgeVariant = "pulse" | "community" | "historical" | "ngn" | "usd" | "new";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  /** pulse/community/historical = data-source, ngn/usd = currency, new = indicator */
  variant?: BadgeVariant;
  /** Leading dot; pulses (new-pulse, 2s) only for variant="new" */
  dot?: boolean;
  children: ReactNode;
}

// Community/historical/USD tints use color-mix() against the semantic/cream
// tokens (per Badge.jsx) rather than a flat token alias, so they're expressed
// as arbitrary values that still only ever reference CSS custom properties —
// no hex or rgba literals.
const variantClasses: Record<BadgeVariant, string> = {
  pulse: "border border-gold bg-surface-gold text-gold-400",
  community:
    "border border-[color-mix(in_srgb,var(--info-500)_25%,transparent)] bg-[color-mix(in_srgb,var(--info-500)_10%,transparent)] text-info-bright",
  historical: "border bg-[color-mix(in_srgb,var(--cream-100)_6%,transparent)] text-content-secondary",
  ngn: "border bg-transparent text-content-secondary",
  usd: "border border-[color-mix(in_srgb,var(--info-500)_25%,transparent)] bg-info-bg text-info-bright",
  new: "border border-gold-active bg-surface-gold text-gold-400",
};

export default function Badge({
  variant = "pulse",
  dot = true,
  children,
  className = "",
  ...rest
}: BadgeProps) {
  return (
    <span
      className={[
        "num inline-flex w-fit items-center gap-1 whitespace-nowrap align-middle",
        "rounded-full px-2 py-0.5 font-body text-xs font-bold leading-normal tracking-wide",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={[
            "h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current",
            variant === "new" ? "animate-new-pulse" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      )}
      {children}
    </span>
  );
}
