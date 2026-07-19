"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { track } from "@vercel/analytics";
import Button from "@/components/ui/Button";
import {
  FUNCTION_OPTIONS,
  LEVEL_OPTIONS,
  EXPERIENCE_OPTIONS,
  LOCATION_OPTIONS,
  WORK_ARRANGEMENT_OPTIONS,
  CURRENCY_OPTIONS,
  GENDER_OPTIONS,
  AGE_RANGE_OPTIONS,
  EDUCATION_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_STAGE_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  COMPANY_AGE_OPTIONS,
  COMPANY_HQ_OPTIONS,
  TEAM_SIZE_OPTIONS,
  REPORT_TO_OPTIONS,
  NEGOTIATION_OUTCOME_OPTIONS,
  BONUS_RANGE_OPTIONS,
  BENEFITS_OPTIONS,
} from "@/lib/form-options";

// ─── Types ───────────────────────────────────────────────────────────────────

type Path = "company" | "anonymous" | null;

interface FormState {
  function: string;
  job_title: string;
  role_level: string;
  years_experience: string;
  location: string;
  location_state: string;
  location_country: string;
  work_arrangement: string;
  confirmed_currency: string;
  multi_currency: boolean | undefined;
  multi_currencies: string[];
  path: Path;
  company_name: string;
  foreign_employer: boolean | undefined;
  industry: string;
  company_stage: string;
  company_size: string;
  company_age: string;
  headquartered_in_nigeria: boolean | undefined;
  company_hq: string;
  team_size: string;
  manage_others: boolean | undefined;
  direct_reports: string;
  report_to: string;
  currency: string;
  monthly_gross: string;
  monthly_net: string;
  negotiated: string;
  negotiation_outcome: string;
  negotiation_result: string;
  has_bonus: boolean | undefined;
  bonus_range: string;
  has_equity: boolean | undefined;
  gender: string;
  age_range: string;
  satisfaction: number;
  education: string;
  benefits: string[];
  custom_benefit: string;
  cp_negotiated: string;
  cp_negotiation_result: string;
  cp_has_equity: boolean | undefined;
  cp_has_bonus: boolean | undefined;
  _honeypot: string;
}

const initialState: FormState = {
  function: "",
  job_title: "",
  role_level: "",
  years_experience: "",
  location: "",
  location_state: "",
  location_country: "",
  work_arrangement: "",
  confirmed_currency: "",
  multi_currency: undefined,
  multi_currencies: [],
  path: null,
  company_name: "",
  foreign_employer: undefined,
  industry: "",
  company_stage: "",
  company_size: "",
  company_age: "",
  headquartered_in_nigeria: undefined,
  company_hq: "",
  team_size: "",
  manage_others: undefined,
  direct_reports: "",
  report_to: "",
  currency: "NGN",
  monthly_gross: "",
  monthly_net: "",
  negotiated: "",
  negotiation_outcome: "",
  negotiation_result: "",
  has_bonus: undefined,
  bonus_range: "",
  has_equity: undefined,
  gender: "",
  age_range: "",
  satisfaction: 0,
  education: "",
  benefits: [],
  custom_benefit: "",
  cp_negotiated: "",
  cp_negotiation_result: "",
  cp_has_equity: undefined,
  cp_has_bonus: undefined,
  _honeypot: "",
};

const DIRECT_REPORTS_OPTIONS = [
  "1-2",
  "3-5",
  "6-10",
  "11-20",
  "20+",
];

const NEGOTIATION_RESULT_OPTIONS = [
  "Exactly what I asked for",
  "Higher than I asked for",
  "Lower than I asked for",
];

function formatCurrency(value: string): string {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-NG");
}

function parseCurrency(formatted: string): string {
  return formatted.replace(/[^0-9]/g, "");
}

// Currency-symbol prefix for the compensation fields, per Input spec (₦
// prefix inside the field). Falls back to ₦ since NGN is the default.
function currencySymbol(code: string): string {
  const opt = CURRENCY_OPTIONS.find((c) => c.value === code);
  return opt ? opt.label.split(" ")[0] : "₦";
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  role: "Tell us about what you do — this helps us group salaries by function and seniority.",
  location: "Where you work affects compensation benchmarks significantly.",
  path: "Naming your employer makes data easier to validate — but it's your choice.",
  company: "Company names are shown publicly alongside salary data to add credibility. Your identity stays anonymous.",
  employer: "Since you're not naming your employer, we need a few details to validate your data.",
  team: "Team context helps us understand your role's scope and responsibility.",
  compensation: "The core of it — what you actually earn.",
  negotiation: "Negotiation and bonus data helps others benchmark their offers.",
  about: "A few details about you for demographic analysis.",
  extras: "These are optional but help paint a fuller picture.",
};

const NIGERIAN_LOCATIONS = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
  "Enugu",
  "Benin City",
  "Calabar",
  "Other Nigeria",
];

// ─── Shared UI Components ────────────────────────────────────────────────────

function Select({
  label,
  value,
  onChange,
  options,
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold tracking-wide text-content-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger-bright">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="num h-11 w-full appearance-none rounded-md border bg-surface-sunken px-3 text-sm text-content-primary transition-colors duration-fast ease-standard hover:border-strong focus:border-gold-400 focus:outline-none"
        style={{ colorScheme: "dark" }}
      >
        <option value="">{placeholder ?? "Select..."}</option>
        {options.map((opt) => {
          const v = typeof opt === "string" ? opt : opt.value;
          const l = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={v} value={v}>
              {l}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  required,
  placeholder,
  inputMode,
  prefix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  inputMode?: "text" | "numeric";
  /** Currency-style prefix rendered inside the field, e.g. "₦" */
  prefix?: string;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold tracking-wide text-content-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger-bright">*</span>}
      </label>
      <div className="flex h-11 items-center gap-2 rounded-md border bg-surface-sunken px-3 transition-colors duration-fast ease-standard hover:border-strong focus-within:border-gold-400">
        {prefix && (
          <span className="text-sm font-bold text-content-tertiary whitespace-nowrap">{prefix}</span>
        )}
        <input
          type="text"
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="num flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-hint focus:outline-none"
        />
      </div>
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold tracking-wide text-content-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger-bright">*</span>}
      </label>
      <div className="flex gap-2">
        {[true, false].map((opt) => (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-md border py-2.5 text-sm font-bold transition-colors duration-fast ease-standard ${
              value === opt
                ? "border-gold-active bg-surface-gold text-content-accent"
                : "bg-surface-sunken text-content-secondary hover:border-strong"
            }`}
          >
            {opt ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </div>
  );
}

function StarRating({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold tracking-wide text-content-secondary">
        {label}
        {required && <span className="ml-0.5 text-danger-bright">*</span>}
      </label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-2xl transition-colors duration-fast ease-standard ${
              star <= value ? "text-content-accent" : "text-content-hint hover:text-gold-400/50"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function Pills({
  label,
  selected,
  onChange,
  options,
}: {
  label: string;
  selected: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt],
    );
  };
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-xs font-bold tracking-wide text-content-secondary">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold tracking-wide transition-colors duration-fast ease-standard ${
              selected.includes(opt)
                ? "border-gold-active bg-surface-gold text-content-accent"
                : "bg-surface-sunken text-content-secondary hover:border-strong"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step progress indicator — per Stepper spec: gold done/active segments,
// border-default upcoming, "Step X of Y" caption (never a smooth % bar).
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="space-y-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      <div className="flex items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-slow ease-decel ${
              i <= current ? "bg-gold-500" : "bg-[var(--border-default)]"
            }`}
          />
        ))}
      </div>
      <p className="num text-xs text-content-tertiary">
        Step {current + 1} of {total}
      </p>
    </div>
  );
}

// ─── Company Search ──────────────────────────────────────────────────────────

function CompanySearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<
    { name: string; industry: string | null; known: boolean }[]
  >([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/companies?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.companies ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
  }, []);

  const commitValue = useCallback((name: string) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  }, [onChange]);

  return (
    <div className="relative space-y-1.5">
      <label className="text-xs font-bold tracking-wide text-content-secondary">
        Company name<span className="ml-0.5 text-danger-bright">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            const v = e.target.value;
            setQuery(v);
            search(v);
            if (value && v !== value) onChange("");
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
              if (query.trim() && !value) onChange(query.trim());
            }, 200);
          }}
          placeholder="Start typing a company name..."
          className="num h-11 w-full rounded-md border bg-surface-sunken px-3 text-sm text-content-primary placeholder:text-content-hint transition-colors duration-fast ease-standard hover:border-strong focus:border-gold-400 focus:outline-none"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-btn-spin rounded-full border-2 border-gold-400/30 border-t-gold-400" />
          </div>
        )}
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border bg-surface-base shadow-2">
          {results.map((r) => (
            <button
              key={r.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commitValue(r.name)}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors duration-fast ease-standard hover:bg-surface-gold ${
                r.known ? "text-content-primary" : "border-t border-subtle text-content-secondary"
              }`}
            >
              <span>{r.name}</span>
              {r.industry && (
                <span className="ml-2 text-xs text-content-tertiary">{r.industry}</span>
              )}
              {!r.known && (
                <span className="ml-2 text-xs text-content-accent/60">+ Add new</span>
              )}
            </button>
          ))}
        </div>
      )}
      {value && (
        <p className="mt-1 text-xs text-content-tertiary">
          Selected: <span className="text-content-primary">{value}</span>
        </p>
      )}
    </div>
  );
}

// ─── Step Definitions ────────────────────────────────────────────────────────

function getSteps(form: FormState): { label: string; key: string }[] {
  const steps: { label: string; key: string }[] = [
    { label: "Your Role", key: "role" },
    { label: "Your Location", key: "location" },
    { label: "Your Path", key: "path" },
  ];

  if (form.path === "company") {
    steps.push({ label: "Your Company", key: "company" });
    steps.push({ label: "Compensation", key: "compensation" });
    steps.push({ label: "About You", key: "about" });
    steps.push({ label: "Extras", key: "extras" });
  } else if (form.path === "anonymous") {
    steps.push({ label: "Your Employer", key: "employer" });
    steps.push({ label: "Your Team", key: "team" });
    steps.push({ label: "Compensation", key: "compensation" });
    steps.push({ label: "Negotiation & Comp", key: "negotiation" });
    steps.push({ label: "About You", key: "about" });
    steps.push({ label: "Extras", key: "extras" });
  }

  return steps;
}

function isRemoteOutsideNigeria(form: FormState): boolean {
  return form.work_arrangement === "Fully remote" && form.location === "Outside Nigeria";
}

function isRemoteInNigeria(form: FormState): boolean {
  return form.work_arrangement === "Fully remote" && NIGERIAN_LOCATIONS.includes(form.location);
}

function canAdvance(step: string, form: FormState): boolean {
  switch (step) {
    case "role":
      return !!(form.function && form.job_title && form.role_level && form.years_experience);
    case "location": {
      const base = !!(form.location && form.work_arrangement);
      if (!base) return false;
      if (form.location === "Other Nigeria" && !form.location_state) return false;
      if (form.location === "Outside Nigeria" && !form.location_country) return false;
      if (isRemoteOutsideNigeria(form)) {
        const hasCurrency = !!form.confirmed_currency;
        const hasMulti = form.multi_currency !== undefined;
        if (form.multi_currency && form.multi_currencies.length === 0) return false;
        return hasCurrency && hasMulti;
      }
      if (isRemoteInNigeria(form)) {
        return form.multi_currency !== undefined && (!form.multi_currency || form.multi_currencies.length > 0);
      }
      return base;
    }
    case "path":
      return form.path !== null;
    case "company":
      return !!form.company_name;
    case "employer": {
      if (!form.industry || form.foreign_employer === undefined) return false;
      if (form.foreign_employer === false) {
        return !!(form.company_stage && form.company_size && form.company_age && form.headquartered_in_nigeria !== undefined);
      }
      return !!(form.company_hq && form.company_size);
    }
    case "team": {
      if (!form.team_size || form.manage_others === undefined || !form.report_to) return false;
      if (form.manage_others && !form.direct_reports) return false;
      return true;
    }
    case "compensation":
      return !!(form.currency && form.monthly_gross && Number(form.monthly_gross) > 0);
    case "negotiation": {
      if (!form.negotiated) return false;
      if ((form.negotiated === "Yes" || form.negotiated === "Sort of") && !form.negotiation_outcome) return false;
      if (form.has_bonus === undefined || form.has_equity === undefined) return false;
      if (form.has_bonus && !form.bonus_range) return false;
      return true;
    }
    case "about": {
      const base = !!(form.gender && form.age_range && form.satisfaction > 0);
      if (form.path === "anonymous") return base && !!form.education;
      return base;
    }
    case "extras":
      return true;
    default:
      return false;
  }
}

// ─── Modal Wrapper ───────────────────────────────────────────────────────────

function FormModal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim: --scrim + --scrim-blur, per Modal spec */}
      <div
        className="fixed inset-0 bg-scrim backdrop-blur-[var(--scrim-blur)]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel: centered via top/left 50% + the modal-in keyframe's own
          translate(-50%,-50%) end state (fill-mode "both" keeps it pinned
          after the animation completes). */}
      <div
        role="dialog"
        aria-modal="true"
        className="animate-modal-in fixed left-1/2 top-1/2 z-10 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto rounded-md border border-strong bg-surface-raised shadow-3"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-content-tertiary hover:text-content-primary transition-colors duration-fast ease-standard"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

// ─── Trigger Button ──────────────────────────────────────────────────────────
// Nav + primary: gold fill + text-content-on-gold (never cream-on-gold),
// hover gold-400. Ghost has no equivalent in ui/Button's variant set (its
// "secondary"/"ghost" are neutral, not gold-outlined), so it stays a
// tokenized style map rather than a Button swap.
const TRIGGER_STYLES: Record<string, string> = {
  primary:
    "bg-gold-500 hover:bg-gold-400 text-content-on-gold font-body font-bold text-sm tracking-wide px-6 py-3 rounded-md transition-colors duration-fast ease-standard",
  ghost:
    "border border-gold hover:bg-surface-gold text-content-accent font-body font-medium text-sm px-5 py-2.5 rounded-md transition-colors duration-fast ease-standard",
  nav: "bg-gold-500 hover:bg-gold-400 text-content-on-gold font-body font-bold text-xs tracking-wide px-4 py-2 rounded-md transition-colors duration-fast ease-standard",
};

export function PulseFormTrigger({
  variant = "primary",
  label,
  className = "",
}: {
  variant?: "primary" | "ghost" | "nav";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const displayLabel = label ?? "Add your numbers";

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          track("form_started", { variant });
        }}
        className={`${TRIGGER_STYLES[variant]} ${className}`}
      >
        {displayLabel}
      </button>
      <FormModal open={open} onClose={() => {
        track("form_modal_closed", { variant });
        setOpen(false);
      }}>
        <PulseFormContent onComplete={() => setOpen(false)} />
      </FormModal>
    </>
  );
}

// ─── Main Form Content ───────────────────────────────────────────────────────

function PulseFormContent({ onComplete }: { onComplete?: () => void }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const startTimeRef = useRef(Date.now());
  const stepStartRef = useRef(Date.now());
  const utmRef = useRef<Record<string, string>>({});

  // Capture UTM params on mount for campaign attribution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    utmKeys.forEach((k) => {
      const v = params.get(k);
      if (v) utmRef.current[k] = v;
    });
    if (document.referrer) utmRef.current.referrer = new URL(document.referrer).hostname;
  }, []);

  // Track step views
  useEffect(() => {
    const steps = getSteps(form);
    const step = steps[currentStep];
    if (step) {
      stepStartRef.current = Date.now();
      track("form_step_viewed", {
        step: step.key,
        step_index: currentStep,
        path: form.path ?? "undecided",
      });
    }
  }, [currentStep, form.path]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!submitted && currentStep > 0) {
        track("form_abandoned", {
          step: steps[currentStep]?.key ?? "unknown",
          path: form.path ?? "undecided",
          seconds_spent: Math.round((Date.now() - startTimeRef.current) / 1000),
          ...utmRef.current,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  const set = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => {
        const updates: Partial<FormState> = { [key]: value };
        if (key === "function" && prev.function && value !== prev.function) {
          updates.job_title = "";
        }
        return { ...prev, ...updates };
      });
      setError(null);
    },
    [],
  );

  const steps = getSteps(form);
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const next = () => {
    if (!step || !canAdvance(step.key, form)) return;
    track("form_step_completed", {
      step: step.key,
      step_index: currentStep,
      path: form.path ?? "undecided",
      step_seconds: Math.round((Date.now() - stepStartRef.current) / 1000),
    });
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const back = () => {
    if (currentStep > 0) {
      track("form_step_back", { from: step?.key ?? "unknown", step_index: currentStep });
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const gross = Number(form.monthly_gross);
    const net = form.monthly_net ? Number(form.monthly_net) : undefined;

    if (net && net > gross) {
      setError("Net salary cannot exceed gross");
      setSubmitting(false);
      return;
    }

    const payload: Record<string, unknown> = {
      _path: form.path,
      function: form.function,
      job_title: form.job_title,
      role_level: form.role_level,
      years_experience: form.years_experience,
      location: form.location,
      location_state: form.location_state || undefined,
      location_country: form.location_country || undefined,
      work_arrangement: form.work_arrangement,
      currency: form.currency,
      monthly_gross: gross,
      monthly_net: net,
      gender: form.gender,
      age_range: form.age_range,
      satisfaction: form.satisfaction,
      confirmed_currency: isRemoteOutsideNigeria(form) ? form.confirmed_currency : undefined,
      multi_currency: form.work_arrangement === "Fully remote" ? form.multi_currency : undefined,
      benefits: (() => {
        const all = [...form.benefits];
        if (form.custom_benefit.trim()) {
          all.push(...form.custom_benefit.split(",").map((b) => b.trim()).filter(Boolean));
        }
        return all.length > 0 ? all : undefined;
      })(),
      _honeypot: form._honeypot,
    };

    if (form.path === "company") {
      payload.company_name = form.company_name;
      payload.education = form.education || undefined;
      payload.negotiated = form.cp_negotiated || undefined;
      payload.negotiation_result = form.cp_negotiation_result || undefined;
      payload.has_equity = form.cp_has_equity;
      payload.has_bonus = form.cp_has_bonus;
    } else {
      payload.foreign_employer = form.foreign_employer;
      payload.industry = form.industry;
      payload.education = form.education;
      payload.team_size = form.team_size;
      payload.manage_others = form.manage_others;
      payload.direct_reports = form.direct_reports || undefined;
      payload.report_to = form.report_to;
      payload.negotiated = form.negotiated;
      payload.negotiation_outcome = form.negotiation_outcome || undefined;
      payload.negotiation_result = form.negotiation_result || undefined;
      payload.has_bonus = form.has_bonus;
      payload.bonus_range = form.bonus_range || undefined;
      payload.has_equity = form.has_equity;
      if (form.foreign_employer === false) {
        payload.company_stage = form.company_stage;
        payload.company_size = form.company_size;
        payload.company_age = form.company_age;
        payload.headquartered_in_nigeria = form.headquartered_in_nigeria;
      } else {
        payload.company_hq = form.company_hq;
        payload.company_size = form.company_size;
      }
    }

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "rate_limited") {
          track("form_rate_limited", { path: form.path ?? "unknown", ...utmRef.current });
          setError(`You've already submitted recently. Please try again in ${data.retry_after_days} day(s).`);
        } else {
          track("form_error", { error: data.error, path: form.path ?? "unknown" });
          setError(data.error || "Submission failed. Please try again.");
        }
        setSubmitting(false);
        return;
      }

      track("form_submitted", {
        path: form.path ?? "unknown",
        total_seconds: Math.round((Date.now() - startTimeRef.current) / 1000),
        steps_completed: steps.length,
        ...utmRef.current,
      });
      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="count-up space-y-4 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-success bg-success-bg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-success-bright"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-content-primary">Thank you!</h2>
        <p className="mx-auto max-w-sm text-sm text-content-secondary">
          Your submission is pending review. Once approved, it will appear in the
          dataset and improve salary benchmarks for everyone.
        </p>
        {onComplete && (
          <Button variant="ghost" onClick={onComplete} className="mt-4">
            Close
          </Button>
        )}
      </div>
    );
  }

  const currencyLabels = CURRENCY_OPTIONS.filter((c) => c.value !== "NGN").map((c) => c.label);

  return (
    <div>
      {/* Progress */}
      <div className="mb-6 space-y-3">
        <StepIndicator current={currentStep} total={steps.length} />
        <div className="text-left">
          <p className="text-sm font-bold text-content-primary">{step?.label}</p>
          <p className="mt-0.5 text-xs text-content-tertiary">
            {step ? STEP_DESCRIPTIONS[step.key] : ""}
          </p>
        </div>
      </div>

      {/* Honeypot */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden>
        <input
          tabIndex={-1}
          autoComplete="off"
          name="website"
          value={form._honeypot}
          onChange={(e) => set("_honeypot", e.target.value)}
        />
      </div>

      {/* Step content — page-enter recipe (dur-slow/ease-decel) replays per
          step via the key, matching the "duration-slow ease-decel" step
          transition rule. */}
      <div className="page-enter space-y-4" key={step?.key}>
        {step?.key === "role" && (
          <>
            <Select label="Function" value={form.function} onChange={(v) => set("function", v)} options={FUNCTION_OPTIONS} required />
            <TextInput label="Job title" value={form.job_title} onChange={(v) => set("job_title", v)} required placeholder="e.g. Senior Product Manager" />
            <Select label="Role level" value={form.role_level} onChange={(v) => set("role_level", v)} options={LEVEL_OPTIONS} required />
            <Select label="Years of experience" value={form.years_experience} onChange={(v) => set("years_experience", v)} options={EXPERIENCE_OPTIONS} required />
          </>
        )}

        {step?.key === "location" && (
          <>
            <Select label="Location" value={form.location} onChange={(v) => { set("location", v); set("location_state", ""); set("location_country", ""); }} options={LOCATION_OPTIONS} required />
            {form.location === "Other Nigeria" && (
              <TextInput label="State" value={form.location_state} onChange={(v) => set("location_state", v)} required placeholder="e.g. Ogun, Kaduna, Ondo" />
            )}
            {form.location === "Outside Nigeria" && (
              <TextInput label="Country" value={form.location_country} onChange={(v) => set("location_country", v)} required placeholder="e.g. United States, United Kingdom" />
            )}
            <Select label="Work arrangement" value={form.work_arrangement} onChange={(v) => set("work_arrangement", v)} options={WORK_ARRANGEMENT_OPTIONS} required />

            {/* Remote + Outside Nigeria: ask what currency they're paid in */}
            {isRemoteOutsideNigeria(form) && (
              <Select
                label="What currency are you paid in?"
                value={form.confirmed_currency}
                onChange={(v) => set("confirmed_currency", v)}
                options={CURRENCY_OPTIONS}
                required
              />
            )}

            {/* Remote (any location): ask about multiple currencies */}
            {form.work_arrangement === "Fully remote" && form.location && (
              <>
                <YesNo
                  label={
                    isRemoteInNigeria(form)
                      ? "Are you paid in any currency besides Naira?"
                      : "Paid in multiple currencies?"
                  }
                  value={form.multi_currency}
                  onChange={(v) => {
                    set("multi_currency", v);
                    if (!v) set("multi_currencies", []);
                  }}
                  required
                />
                {form.multi_currency && (
                  <Pills
                    label="Which currencies? (select all that apply)"
                    selected={form.multi_currencies}
                    onChange={(v) => set("multi_currencies", v)}
                    options={currencyLabels}
                  />
                )}
              </>
            )}
          </>
        )}

        {step?.key === "path" && (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-content-primary">
              Would you like to name your employer? Company names are shown publicly
              alongside salary data to add credibility — but <strong>your identity
              stays completely anonymous</strong>. There&apos;s no way to trace a data
              point back to you.
            </p>
            {[
              { value: "company" as const, label: "Yes, I'll name my employer", desc: "Shorter form — company name covers many validation fields" },
              { value: "anonymous" as const, label: "No, keep it anonymous", desc: "A few more questions to help us validate your data" },
            ].map((opt) => {
              const selected = form.path === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    set("path", opt.value);
                    track("form_path_chosen", { path: opt.value });
                  }}
                  className={`flex w-full items-start gap-3 rounded-md border p-4 text-left transition-colors duration-fast ease-standard ${
                    selected
                      ? "border-gold-active bg-surface-gold"
                      : "border-subtle bg-surface-base hover:border-gold-hover"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full ${
                      selected ? "bg-gold-400" : "border-2 border-strong"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-surface-canvas" />}
                  </span>
                  <span>
                    <p className={`text-sm font-bold ${selected ? "text-content-accent" : "text-content-primary"}`}>
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-content-secondary">{opt.desc}</p>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step?.key === "company" && (
          <CompanySearch value={form.company_name} onChange={(v) => set("company_name", v)} />
        )}

        {step?.key === "employer" && (
          <>
            <YesNo label="Do you work for a foreign employer?" value={form.foreign_employer} onChange={(v) => set("foreign_employer", v)} required />
            <Select label="Industry" value={form.industry} onChange={(v) => set("industry", v)} options={INDUSTRY_OPTIONS} required />
            {form.foreign_employer === false && (
              <>
                <Select label="Company stage" value={form.company_stage} onChange={(v) => set("company_stage", v)} options={COMPANY_STAGE_OPTIONS} required />
                <Select label="Company size (employees)" value={form.company_size} onChange={(v) => set("company_size", v)} options={COMPANY_SIZE_OPTIONS} required />
                <Select label="Company age" value={form.company_age} onChange={(v) => set("company_age", v)} options={COMPANY_AGE_OPTIONS} required />
                <YesNo label="Headquartered in Nigeria?" value={form.headquartered_in_nigeria} onChange={(v) => set("headquartered_in_nigeria", v)} required />
              </>
            )}
            {form.foreign_employer === true && (
              <>
                <Select label="Company HQ" value={form.company_hq} onChange={(v) => set("company_hq", v)} options={COMPANY_HQ_OPTIONS} required />
                <Select label="Company size (employees)" value={form.company_size} onChange={(v) => set("company_size", v)} options={COMPANY_SIZE_OPTIONS} required />
              </>
            )}
          </>
        )}

        {step?.key === "team" && (
          <>
            <Select label="Team size" value={form.team_size} onChange={(v) => set("team_size", v)} options={TEAM_SIZE_OPTIONS} required />
            <YesNo label="Do you manage others?" value={form.manage_others} onChange={(v) => set("manage_others", v)} required />
            {form.manage_others && (
              <Select label="How many direct reports?" value={form.direct_reports} onChange={(v) => set("direct_reports", v)} options={DIRECT_REPORTS_OPTIONS} required />
            )}
            <Select label="Who do you report to?" value={form.report_to} onChange={(v) => set("report_to", v)} options={REPORT_TO_OPTIONS} required />
          </>
        )}

        {step?.key === "compensation" && (
          <>
            <Select label="Currency" value={form.currency} onChange={(v) => set("currency", v)} options={CURRENCY_OPTIONS} required />
            <TextInput
              label="Monthly gross salary"
              value={formatCurrency(form.monthly_gross)}
              onChange={(v) => set("monthly_gross", parseCurrency(v))}
              required
              placeholder="e.g. 800,000"
              inputMode="numeric"
              prefix={currencySymbol(form.currency)}
            />
            <TextInput
              label="Monthly net salary (take-home after tax)"
              value={formatCurrency(form.monthly_net)}
              onChange={(v) => set("monthly_net", parseCurrency(v))}
              placeholder="Optional"
              inputMode="numeric"
              prefix={currencySymbol(form.currency)}
            />
          </>
        )}

        {step?.key === "negotiation" && (
          <>
            <Select label="Did you negotiate your salary?" value={form.negotiated} onChange={(v) => set("negotiated", v)} options={["Yes", "Sort of", "No"]} required />
            {(form.negotiated === "Yes" || form.negotiated === "Sort of") && (
              <>
                <Select label="Negotiation outcome" value={form.negotiation_outcome} onChange={(v) => set("negotiation_outcome", v)} options={NEGOTIATION_OUTCOME_OPTIONS} required />
                <Select label="Did you earn what you negotiated?" value={form.negotiation_result} onChange={(v) => set("negotiation_result", v)} options={NEGOTIATION_RESULT_OPTIONS} />
              </>
            )}
            <YesNo label="Do you receive an annual bonus?" value={form.has_bonus} onChange={(v) => set("has_bonus", v)} required />
            {form.has_bonus && (
              <Select label="Bonus range (% of annual salary)" value={form.bonus_range} onChange={(v) => set("bonus_range", v)} options={BONUS_RANGE_OPTIONS} required />
            )}
            <YesNo label="Do you have equity/stock options?" value={form.has_equity} onChange={(v) => set("has_equity", v)} required />
          </>
        )}

        {step?.key === "about" && (
          <>
            <Select label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={GENDER_OPTIONS} required />
            <Select label="Age range" value={form.age_range} onChange={(v) => set("age_range", v)} options={AGE_RANGE_OPTIONS} required />
            <StarRating label="Overall compensation satisfaction" value={form.satisfaction} onChange={(v) => set("satisfaction", v)} required />
            <Select
              label={form.path === "anonymous" ? "Education" : "Education (optional)"}
              value={form.education}
              onChange={(v) => set("education", v)}
              options={EDUCATION_OPTIONS}
              required={form.path === "anonymous"}
            />
          </>
        )}

        {step?.key === "extras" && (
          <>
            <Pills label="Benefits you receive" selected={form.benefits} onChange={(v) => set("benefits", v)} options={BENEFITS_OPTIONS} />
            <TextInput
              label="Other benefits not listed above"
              value={form.custom_benefit}
              onChange={(v) => set("custom_benefit", v)}
              placeholder="e.g. Childcare support, Relocation package"
            />
            {form.path === "company" && (
              <>
                <Select label="Did you negotiate?" value={form.cp_negotiated} onChange={(v) => set("cp_negotiated", v)} options={["Yes", "Sort of", "No"]} />
                {(form.cp_negotiated === "Yes" || form.cp_negotiated === "Sort of") && (
                  <Select label="Did you earn what you negotiated?" value={form.cp_negotiation_result} onChange={(v) => set("cp_negotiation_result", v)} options={NEGOTIATION_RESULT_OPTIONS} />
                )}
                <YesNo label="Equity/stock options?" value={form.cp_has_equity} onChange={(v) => set("cp_has_equity", v)} />
                <YesNo label="Annual bonus?" value={form.cp_has_bonus} onChange={(v) => set("cp_has_bonus", v)} />
              </>
            )}
          </>
        )}
      </div>

      {/* Error — kept as text-danger-bright per validation-copy rule rather
          than InlineAlert, whose message tier defaults to content-secondary. */}
      {error && (
        <div className="mt-4 rounded-sm border-l-[3px] border-danger bg-danger-bg p-3 text-sm text-danger-bright">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {currentStep > 0 && (
          <Button type="button" variant="secondary" onClick={back}>
            Back
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          onClick={next}
          disabled={!step || !canAdvance(step.key, form) || submitting}
          loading={submitting}
          className="flex-1"
        >
          {submitting
            ? "Submitting..."
            : isLastStep
              ? "Submit"
              : "Continue"}
        </Button>
      </div>
    </div>
  );
}

export default PulseFormContent;
