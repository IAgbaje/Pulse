"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";

type StatCardVariant = "compact" | "large" | "default" | "hero" | "count";
type StatCardState = "success" | "partial" | "loading" | "error" | "empty";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: StatCardVariant;
  animate?: boolean;
  /** Backing sample size — rendered as "· N records · YEAR" per the n+year rule. */
  sampleSize?: number;
  year?: number | string;
  delta?: string;
  deltaDirection?: "up" | "down";
  /** Defaults to "success" — existing callers are unaffected. */
  state?: StatCardState;
  errorMessage?: string;
  onRetry?: () => void;
}

function useCountUp(target: number, animate: boolean, duration = 1500) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate || target === 0) {
      setCurrent(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, animate, duration]);

  return current;
}

function parseNumericValue(value: string | number): number | null {
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[₦£$,KkMm%×x]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (value.toLowerCase().includes("m")) return num * 1000000;
  if (value.toLowerCase().includes("k")) return num * 1000;
  return num;
}

// Compact ₦ formatting matching lib/data's formatCurrency, local to avoid
// pulling the dataset into this client component's bundle.
function formatCompactNaira(value: number): string {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${Math.round(value / 1000)}K`;
  return `₦${value.toLocaleString()}`;
}

export default function StatCard({
  label,
  value,
  subtitle,
  variant = "compact",
  animate = true,
  sampleSize,
  year,
  delta,
  deltaDirection,
  state = "success",
  errorMessage,
  onRetry,
}: StatCardProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numeric = parseNumericValue(value);
  const shouldAnimate = animate && numeric !== null && inView && state === "success";
  const animatedNum = useCountUp(numeric ?? 0, shouldAnimate);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Re-format animated values with the same notation as the original string,
  // so "₦589K" animates as compact naira rather than "₦589,000K".
  const displayValue = shouldAnimate || inView
    ? typeof value === "string"
      ? value.startsWith("₦")
        ? formatCompactNaira(animatedNum)
        : value.replace(/\d[\d.,]*/g, animatedNum.toLocaleString())
      : animatedNum.toLocaleString()
    : value;

  const isHero = variant === "large" || variant === "hero";
  const isCount = variant === "count";

  if (state === "loading") {
    return (
      <div
        ref={ref}
        aria-busy="true"
        aria-label={`Loading ${label}`}
        className="flex min-h-[132px] flex-col gap-1 rounded-md border border-subtle bg-surface-base p-5"
      >
        <Skeleton height={10} width="40%" />
        <Skeleton height={34} width="65%" className="mt-3 mb-1" />
        <Skeleton height={12} width="80%" />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div
        ref={ref}
        className="flex min-h-[132px] flex-col items-center justify-center gap-1 rounded-md border border-dashed border-subtle bg-transparent p-5 text-center"
      >
        <p className="font-body text-lg font-bold text-content-primary">No records yet</p>
        <p className="text-xs text-content-secondary">Contribute to unlock this cut.</p>
      </div>
    );
  }

  const containerClass = [
    "relative flex min-h-[132px] flex-col gap-1 overflow-hidden rounded-md border p-5",
    "transition-colors duration-fast ease-standard",
    state === "error"
      ? "border-danger bg-danger-bg"
      : isHero
      ? "border-gold bg-surface-gold"
      : "border-subtle bg-surface-base",
  ].join(" ");

  const valueColorClass =
    state === "error"
      ? "text-danger-bright"
      : state === "partial"
      ? "text-warning-bright"
      : isCount
      ? "text-content-primary"
      : "text-content-accent";

  return (
    <div ref={ref} className={containerClass} role={state === "error" ? "alert" : undefined}>
      <p
        className={[
          "font-body text-xs font-bold uppercase tracking-caps",
          state === "error" ? "text-danger-bright" : "text-content-tertiary",
        ].join(" ")}
      >
        {label}
      </p>

      {state === "error" ? (
        <p className="mt-2 font-body text-lg text-danger-bright">
          {errorMessage ?? "Couldn't load this figure."}
        </p>
      ) : (
        <p className={["display num mt-2", isHero ? "text-display-md" : "text-display-sm", valueColorClass].join(" ")}>
          {displayValue}
        </p>
      )}

      {subtitle && state !== "error" && (
        <p className="text-xs text-content-secondary">
          {subtitle}
          {sampleSize != null && (
            <span className="num text-content-tertiary">
              {" "}· {sampleSize} records{year != null ? <> · {year}</> : null}
            </span>
          )}
        </p>
      )}

      {delta && numeric !== 0 && state !== "error" && (
        <span
          className={[
            "num mt-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
            deltaDirection === "up" ? "bg-success-bg text-success-bright" : "bg-danger-bg text-danger-bright",
          ].join(" ")}
        >
          {delta}
        </span>
      )}

      {state === "error" && onRetry && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onRetry}
          className="mt-2 h-auto w-fit border-danger px-2.5 py-1 text-xs text-danger-bright hover:border-danger"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
