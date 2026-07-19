"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

interface InsightCardProps {
  stat: string;
  title: string;
  body: string;
  /** Which slice of the data this insight is computed from, e.g. "2026 dataset". */
  basis?: string;
  index?: number;
}

export default function InsightCard({ stat, title, body, basis, index = 0 }: InsightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: (index % 2) * 0.08 }}
      className="surface-card flex flex-col gap-3"
    >
      {basis && (
        <p className="font-body text-xs font-bold uppercase tracking-caps text-content-tertiary">{basis}</p>
      )}
      <p className="display num text-display-md text-content-accent">{stat}</p>
      <p className="font-body text-base font-semibold text-content-primary">{title}</p>
      <p className="font-body text-sm leading-relaxed text-content-secondary">{body}</p>
    </motion.div>
  );
}
