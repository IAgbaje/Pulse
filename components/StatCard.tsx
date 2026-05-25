"use client";

import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "compact" | "large";
  animate?: boolean;
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

export default function StatCard({ label, value, subtitle, variant = "compact", animate = true }: StatCardProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numeric = parseNumericValue(value);
  const shouldAnimate = animate && numeric !== null && inView;
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

  const displayValue = shouldAnimate || inView
    ? typeof value === "string"
      ? value.replace(/\d[\d.,]*/g, animatedNum.toLocaleString())
      : animatedNum.toLocaleString()
    : value;

  if (variant === "large") {
    return (
      <div ref={ref} className="gold-card">
        <p className="label-caps mb-2">{label}</p>
        <p className="font-display text-4xl text-gold tabular-nums">{displayValue}</p>
        {subtitle && <p className="text-xs text-cream-40 mt-1">{subtitle}</p>}
      </div>
    );
  }

  return (
    <div ref={ref} className="surface-card">
      <p className="label-caps mb-3">{label}</p>
      <p className="font-display text-3xl text-gold tabular-nums">{displayValue}</p>
      {subtitle && <p className="text-sm text-cream-60 mt-1">{subtitle}</p>}
    </div>
  );
}
