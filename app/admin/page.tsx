"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Submission {
  id: string;
  status: string;
  company_path: boolean;
  monthly_gross: number;
  monthly_net: number | null;
  currency: string;
  function: string;
  job_title: string;
  role_level: string;
  years_experience: string;
  location: string;
  location_state: string | null;
  location_country: string | null;
  work_arrangement: string;
  gender: string;
  age_range: string;
  satisfaction: number | null;
  company_name: string | null;
  industry: string | null;
  company_stage: string | null;
  company_size: string | null;
  negotiated: string | null;
  negotiation_result: string | null;
  benefits: string[] | null;
  duplicate_flag: boolean;
  submission_date: string;
  reviewer_note: string | null;
}

function formatMoney(amount: number, currency: string): string {
  const symbols: Record<string, string> = { NGN: "₦", USD: "$", GBP: "£", EUR: "€" };
  const sym = symbols[currency] ?? currency + " ";
  return `${sym}${amount.toLocaleString("en-NG")}`;
}

type EditableKey = keyof Submission;

const EDITABLE_FIELDS: { key: EditableKey; label: string; type?: "text" | "number" | "select"; options?: string[] }[] = [
  { key: "function", label: "Function", type: "select", options: ["Engineering", "Product Management", "Design", "Data", "Marketing", "Sales & Business Development", "Operations", "Finance", "People/HR", "Legal", "Customer Success", "Other"] },
  { key: "job_title", label: "Job title" },
  { key: "role_level", label: "Level", type: "select", options: ["Junior (0-2 yrs)", "Mid-level (2-4 yrs)", "Senior (4-8 yrs)", "Lead\\Staff (6-10 yrs)", "Director"] },
  { key: "currency", label: "Currency", type: "select", options: ["NGN", "USD", "GBP", "EUR"] },
  { key: "monthly_gross", label: "Monthly gross", type: "number" },
  { key: "monthly_net", label: "Monthly net", type: "number" },
  { key: "location", label: "Location" },
  { key: "location_state", label: "State" },
  { key: "location_country", label: "Country" },
  { key: "work_arrangement", label: "Work arrangement", type: "select", options: ["On-site", "Remote (Nigeria)", "Remote (International)", "Hybrid"] },
  { key: "industry", label: "Industry" },
  { key: "company_name", label: "Company name" },
  { key: "company_stage", label: "Company stage" },
  { key: "company_size", label: "Company size" },
  { key: "negotiated", label: "Negotiated", type: "select", options: ["Yes", "Sort of", "No"] },
  { key: "negotiation_result", label: "Negotiation result" },
];

function EditableField({
  field,
  value,
  onSave,
}: {
  field: (typeof EDITABLE_FIELDS)[number];
  value: string | number | null | undefined;
  onSave: (key: string, value: string | number | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const displayValue = value == null || value === "" ? "–" : String(value);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    const newValue = field.type === "number"
      ? (trimmed === "" ? null : Number(trimmed))
      : (trimmed === "" ? null : trimmed);

    if (String(newValue ?? "") !== String(value ?? "")) {
      onSave(field.key, newValue);
    }
  };

  if (!editing) {
    return (
      <div className="flex justify-between py-1.5 border-b border-subtle group">
        <span className="text-content-tertiary text-xs">{field.label}</span>
        <button
          onClick={() => { setDraft(String(value ?? "")); setEditing(true); }}
          className="text-content-primary text-xs text-right max-w-[60%] hover:text-content-accent transition-colors duration-fast ease-standard cursor-pointer group-hover:underline decoration-dotted underline-offset-2"
          title="Click to edit"
        >
          {displayValue}
        </button>
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="flex justify-between items-center py-1 border-b border-gold-hover">
        <span className="text-content-accent text-xs font-medium">{field.label}</span>
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          className="bg-surface-sunken border border-gold-active rounded-sm px-2 py-1 text-content-primary text-xs max-w-[60%]"
        >
          <option value="">–</option>
          {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center py-1 border-b border-gold-hover">
      <span className="text-content-accent text-xs font-medium">{field.label}</span>
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={field.type === "number" ? "number" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="bg-surface-sunken border border-gold-active rounded-sm px-2 py-1 text-content-primary text-xs max-w-[60%] text-right num"
      />
    </div>
  );
}

function SubmissionCard({
  sub,
  token,
  onAction,
}: {
  sub: Submission;
  token: string;
  onAction: () => void;
}) {
  const [acting, setActing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [local, setLocal] = useState(sub);
  const [pendingEdits, setPendingEdits] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const hasEdits = Object.keys(pendingEdits).length > 0;

  const handleFieldSave = (key: string, value: string | number | null) => {
    setLocal((prev) => ({ ...prev, [key]: value }));
    setPendingEdits((prev) => ({ ...prev, [key]: value }));
    setSaveMsg("");
  };

  const saveEdits = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id: sub.id, updates: pendingEdits }),
      });
      if (res.ok) {
        const data = await res.json();
        setPendingEdits({});
        setSaveMsg(`Saved: ${data.updated.join(", ")}`);
      } else {
        const err = await res.json();
        setSaveMsg(`Error: ${err.error}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const act = async (action: "approve" | "reject") => {
    if (hasEdits) await saveEdits();
    setActing(true);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-token": token },
        body: JSON.stringify({ id: sub.id, action }),
      });
      if (res.ok) onAction();
    } finally {
      setActing(false);
    }
  };

  const date = new Date(sub.submission_date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`surface-card mb-3 ${sub.duplicate_flag ? "border-l-2 border-l-danger" : ""}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-content-primary font-semibold text-sm">
            {local.function} · {local.role_level.split(" (")[0]}
            {local.company_name && <span className="text-content-accent ml-2">@ {local.company_name}</span>}
          </p>
          <p className="text-content-tertiary text-xs mt-0.5">
            {date} · {sub.company_path ? "Company path" : "Anonymous path"}
            {sub.duplicate_flag && <span className="text-danger-bright ml-2">⚠ Possible duplicate</span>}
          </p>
        </div>
        <p className="text-content-accent font-body font-bold num text-lg">
          {formatMoney(local.monthly_gross, local.currency)}
        </p>
      </div>

      <div className="flex gap-3 text-xs text-content-secondary mb-3">
        <span>{local.location}{local.location_state ? `, ${local.location_state}` : ""}{local.location_country ? ` (${local.location_country})` : ""}</span>
        <span>·</span>
        <span>{local.work_arrangement}</span>
        {local.industry && <><span>·</span><span>{local.industry}</span></>}
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-content-accent hover:underline mb-3"
      >
        {expanded ? "Hide details" : "Show details · click any value to edit"}
      </button>

      {expanded && (
        <div className="mb-3">
          {EDITABLE_FIELDS.map((field) => {
            const raw = local[field.key];
            const val: string | number | null | undefined =
              typeof raw === "boolean" || Array.isArray(raw) ? String(raw) : raw;
            return (
              <EditableField
                key={field.key}
                field={field}
                value={val}
                onSave={handleFieldSave}
              />
            );
          })}
          <div className="flex justify-between py-1.5 border-b border-subtle">
            <span className="text-content-tertiary text-xs">Gender</span>
            <span className="text-content-primary text-xs">{local.gender}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-subtle">
            <span className="text-content-tertiary text-xs">Age range</span>
            <span className="text-content-primary text-xs">{local.age_range}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-subtle">
            <span className="text-content-tertiary text-xs">Satisfaction</span>
            <span className="text-content-primary text-xs">{local.satisfaction ? `${local.satisfaction}/5` : "–"}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-subtle">
            <span className="text-content-tertiary text-xs">Benefits</span>
            <span className="text-content-primary text-xs text-right max-w-[60%]">{local.benefits?.join(", ") ?? "–"}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-content-tertiary text-xs">ID</span>
            <span className="text-content-tertiary text-[10px] font-mono num">{sub.id}</span>
          </div>

          {hasEdits && (
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={saveEdits}
                disabled={saving}
                className="bg-info hover:bg-info-bright text-navy-950 text-xs font-semibold px-4 py-1.5 rounded-sm transition-colors duration-fast ease-standard disabled:opacity-50"
              >
                {saving ? "Saving…" : `Save ${Object.keys(pendingEdits).length} edit${Object.keys(pendingEdits).length > 1 ? "s" : ""}`}
              </button>
              <button
                onClick={() => { setPendingEdits({}); setLocal(sub); setSaveMsg(""); }}
                className="text-xs text-content-tertiary hover:text-content-primary"
              >
                Discard
              </button>
            </div>
          )}
          {saveMsg && (
            <p className={`text-xs mt-2 ${saveMsg.startsWith("Error") ? "text-danger-bright" : "text-success-bright"}`}>
              {saveMsg}
            </p>
          )}
        </div>
      )}

      {sub.status === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => act("approve")}
            disabled={acting}
            className="bg-success hover:bg-success-bright text-navy-950 text-xs font-semibold px-4 py-1.5 rounded-sm transition-colors duration-fast ease-standard disabled:opacity-50"
          >
            {hasEdits ? "Save & Approve" : "Approve"}
          </button>
          <button
            onClick={() => act("reject")}
            disabled={acting}
            className="bg-danger hover:bg-danger-bright text-navy-950 text-xs font-semibold px-4 py-1.5 rounded-sm transition-colors duration-fast ease-standard disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [companySearch, setCompanySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ status: statusFilter });
    if (companySearch.trim()) params.set("company", companySearch.trim());
    try {
      const res = await fetch(`/api/admin/submissions?${params}`, {
        headers: { "x-admin-token": token },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setError("Invalid token");
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions ?? []);
    } catch {
      setError("Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, companySearch]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = setTimeout(fetchSubmissions, companySearch ? 400 : 0);
    return () => clearTimeout(timer);
  }, [authenticated, statusFilter, companySearch, fetchSubmissions]);

  if (!authenticated) {
    return (
      <div className="min-h-screen">
        <div className="max-w-sm mx-auto px-6 pt-24">
          <h1 className="text-xl font-semibold text-content-primary mb-4">Admin</h1>
          {error && <p className="text-danger-bright text-sm mb-3">{error}</p>}
          <input
            type="password"
            placeholder="Admin token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && token && setAuthenticated(true)}
            className="w-full bg-surface-sunken border border-gold-hover rounded-sm px-3 py-2 text-content-primary text-sm mb-3 focus:border-gold-active placeholder:text-content-tertiary transition-colors duration-fast ease-standard"
          />
          <button
            onClick={() => token && setAuthenticated(true)}
            className="bg-gold-500 hover:bg-gold-400 text-content-on-gold font-semibold text-sm px-6 py-2 rounded-sm transition-colors duration-fast ease-standard w-full"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-content-primary">Submission Review</h1>
          <div className="flex gap-2">
            {["pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-sm font-medium transition-colors duration-fast ease-standard ${
                  statusFilter === s
                    ? "bg-gold-500 text-content-on-gold"
                    : "border border-gold-hover text-content-secondary hover:text-content-primary"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by company name…"
          value={companySearch}
          onChange={(e) => setCompanySearch(e.target.value)}
          className="w-full bg-surface-sunken border border-gold-hover rounded-sm px-3 py-2 text-content-primary text-sm mb-4 focus:border-gold-active placeholder:text-content-tertiary transition-colors duration-fast ease-standard"
        />

        {loading && <p className="text-content-tertiary text-sm">Loading…</p>}
        {!loading && submissions.length === 0 && (
          <div className="surface-card text-center py-10">
            <p className="text-content-tertiary text-sm">No {statusFilter} submissions.</p>
          </div>
        )}
        {submissions.map((sub) => (
          <SubmissionCard key={sub.id} sub={sub} token={token} onAction={fetchSubmissions} />
        ))}
      </div>
    </div>
  );
}
