"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

// Toast.d.ts names this variant "error"; renamed to "danger" here to match
// this repo's token names (--danger-*, colors.danger in tailwind.config.ts)
// and the Badge/Button variant vocabulary. Same colors, same semantics.
export type ToastVariant = "success" | "warning" | "danger" | "info";

export interface ToastProps {
  variant?: ToastVariant;
  title?: string;
  message: string;
  onDismiss?: () => void;
  /**
   * Auto-dismiss delay in ms. Defaults to 4000 for success/info and 0
   * (persist until manually dismissed) for warning/danger, per spec.
   */
  duration?: number;
}

export interface InlineAlertProps {
  variant?: ToastVariant;
  title?: string;
  message: string;
  action?: string;
  onAction?: () => void;
}

const toastTokens: Record<ToastVariant, { bg: string; border: string; icon: string; Icon: typeof Info }> = {
  success: { bg: "bg-success-bg", border: "border-success", icon: "text-success-bright", Icon: CheckCircle2 },
  warning: { bg: "bg-warning-bg", border: "border-warning", icon: "text-warning-bright", Icon: AlertTriangle },
  danger: { bg: "bg-danger-bg", border: "border-danger", icon: "text-danger-bright", Icon: AlertCircle },
  info: { bg: "bg-info-bg", border: "border-info", icon: "text-info-bright", Icon: Info },
};

const DEFAULT_AUTO_DISMISS_MS = 4000;

export function Toast({ variant = "info", title, message, onDismiss, duration }: ToastProps) {
  const t = toastTokens[variant];
  const autoDismisses = variant === "success" || variant === "info";
  const configuredMs = duration ?? (autoDismisses ? DEFAULT_AUTO_DISMISS_MS : 0);

  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(configuredMs);
  const startedAtRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTimer = (ms: number) => {
    if (!onDismiss || ms <= 0) return;
    startedAtRef.current = Date.now();
    timeoutRef.current = setTimeout(() => setIsExiting(true), ms);
  };

  // Start the auto-dismiss countdown once on mount.
  useEffect(() => {
    startTimer(configuredMs);
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run the toast-out animation before actually calling onDismiss.
  useEffect(() => {
    if (!isExiting) return;
    const durMs = 220; // matches --dur-base
    const t2 = setTimeout(() => onDismiss?.(), durMs);
    return () => clearTimeout(t2);
  }, [isExiting, onDismiss]);

  const handleMouseEnter = () => {
    if (configuredMs <= 0 || !timeoutRef.current || startedAtRef.current == null) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(remainingRef.current - elapsed, 0);
    clearTimer();
  };

  const handleMouseLeave = () => {
    if (configuredMs <= 0 || isExiting) return;
    startTimer(remainingRef.current);
  };

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={[
        "flex items-start gap-3 rounded-md border p-4 shadow-2",
        "font-body",
        t.bg,
        t.border,
        isExiting ? "animate-toast-out" : "animate-toast-in",
      ].join(" ")}
    >
      <t.Icon aria-hidden="true" size={16} strokeWidth={1.75} className={["mt-0.5 flex-shrink-0", t.icon].join(" ")} />
      <div className="flex-1">
        {title && <div className={["mb-0.5 text-sm font-bold", t.icon].join(" ")}>{title}</div>}
        <div className="text-sm leading-snug text-content-secondary">{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={() => setIsExiting(true)}
          aria-label="Dismiss"
          className="flex-shrink-0 rounded-sm p-0 text-content-tertiary transition-colors duration-fast ease-standard hover:text-content-primary"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}

export function InlineAlert({ variant = "info", title, message, action, onAction }: InlineAlertProps) {
  const t = toastTokens[variant];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={["rounded-sm border-l-[3px] p-3 font-body", t.bg, t.border].join(" ")}
    >
      {title && <div className={["mb-0.5 text-sm font-bold", t.icon].join(" ")}>{title}</div>}
      <div className="text-sm leading-snug text-content-secondary">{message}</div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className={["mt-2 p-0 text-xs font-bold", t.icon].join(" ")}
        >
          {action}
        </button>
      )}
    </div>
  );
}
