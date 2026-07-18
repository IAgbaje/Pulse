import { forwardRef, type ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size: sm (32px), md (40px), lg (48px) */
  size?: ButtonSize;
  /** Icon-only mode — square button */
  iconOnly?: boolean;
  /** Show loading spinner; label stays mounted so width doesn't jump */
  loading?: boolean;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-md",
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 w-8 p-0",
  md: "h-10 w-10 p-0",
  lg: "h-12 w-12 p-0",
};

// Primary/destructive: navy-950 (text-on-gold) label on colored fill — 7.04:1
// contrast. Cream on gold is 2.25:1 and is FORBIDDEN by the design system.
const variantClasses: Record<ButtonVariant, string> = {
  primary: "border border-transparent bg-gold-500 text-content-on-gold hover:bg-gold-400",
  secondary: "border text-content-primary hover:border-strong",
  ghost: "border border-transparent text-content-secondary hover:bg-surface-raised",
  destructive: "border border-transparent bg-danger text-content-on-gold hover:bg-danger-bright",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    iconOnly = false,
    loading = false,
    disabled = false,
    children,
    className = "",
    type = "button",
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap",
        "rounded-sm font-body font-bold tracking-wide",
        "transition-colors duration-fast ease-standard active:translate-y-px",
        "disabled:cursor-not-allowed disabled:opacity-40",
        iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size],
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 flex-shrink-0 animate-btn-spin rounded-full border-2 border-current border-r-transparent"
        />
      )}
      {children}
    </button>
  );
});

export default Button;
