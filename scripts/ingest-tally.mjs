// Ingest a Tally CSV export, replacing the entire pulse_2026 cohort.
// The Tally export is the source of truth for 2026 submissions.
//
// Usage: node scripts/ingest-tally.mjs <path-to-export.csv>
//
// Cleaning rules (each application is reported):
//  - thousands rule:  NGN value 100–29,999 → ×1000 ("650" means ₦650K)
//  - annual rule:     NGN gross ≥8× net and gross/12 ≈ net (±30%) → gross ÷12
//  - annual-pair rule: NGN gross == net ≥ ₦10M → both ÷12 (annual typed twice)
//  - GBP/foreign annual rule: gross ≥10× net and (gross/12)/net in 1.0–2.5 → ÷12
//  - residual NGN values outside ₦30K–₦20M → nulled and reported

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const csvPath = process.argv[2];
if (!csvPath) { console.error("Usage: node scripts/ingest-tally.mjs <export.csv>"); process.exit(1); }

// --- minimal CSV parser (handles quoted fields, "" escapes, embedded newlines) ---
function parseCSV(text) {
  const rows = []; let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.length > 1 || row[0] !== "") rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parseCSV(readFileSync(csvPath, "utf8").replace(/^﻿/, ""));
const header = rows[0];
const col = (name) => {
  const i = header.findIndex((h) => h === name);
  if (i === -1) { console.error(`Missing column: ${name}`); process.exit(1); }
  return i;
};

const C = {
  id: col("Submission ID"),
  date: col("Submitted at"),
  fn: col("What function do you work in?"),
  gender: col("What is your gender?"),
  level: col("What is your role level?"),
  location: col("Where are you currently based?"),
  work: col("How do you currently work?"),
  size: col("How many people work at your company?"),
  stage: col("What stage is your company at?"),
  industry: col("What industry does your company primarily operate in?"),
  currency: col("What currency are you primarily paid in?"),
  gross: col("What is your monthly GROSS salary? (Before tax and deductions)"),
  net: col("What is your monthly NET salary? (What actually hits your account)"),
  negotiated: col("Did you negotiate your salary for this role?"),
};

// Benefit checkbox columns → short labels matching the existing dataset style.
const BENEFIT_COLS = [
  ["Beyond salary, what else do you receive? (Health insurance — individual cover)", "Health (individual)"],
  ["Beyond salary, what else do you receive? (Health insurance — family cover)", "Health (family)"],
  ["Beyond salary, what else do you receive? (Employer pension / RSA contributions)", "Pension"],
  ["Beyond salary, what else do you receive? (Internet or data allowance)", "Internet"],
  ["Beyond salary, what else do you receive? (Device provided or equipment stipend)", "Device"],
  ["Beyond salary, what else do you receive? (Learning & development budget)", "L&D budget"],
  ["Beyond salary, what else do you receive? (Transport allowance)", "Transport"],
  ["Beyond salary, what else do you receive? (Housing allowance)", "Housing"],
  ["Beyond salary, what else do you receive? (Meal allowance)", "Meals"],
  ["Beyond salary, what else do you receive? (Gym or wellness benefit)", "Gym"],
  ["Beyond salary, what else do you receive? (Remote work / home office stipend)", "Remote stipend"],
  ["Beyond salary, what else do you receive? (Paid parental leave)", "Parental leave"],
  ["Beyond salary, what else do you receive? (Annual leave above the statutory minimum)", "Extra annual leave"],
  ["Beyond salary, what else do you receive? (Visa or relocation support)", "Visa/relocation"],
  ["Beyond salary, what else do you receive? (Annual or biannual flight tickets)", "Flights"],
].map(([name, label]) => [col(name), label]);

const FUNCTION_MAP = {
  "Product Management": "Product Management",
  "Sales & Business Development": "Sales & Business Development",
  "Operations (Business Ops, Product Ops, Project Management)": "Operations",
  "Finance & Accounting": "Finance & Accounting",
  "Marketing (Growth, Content, Brand, Performance)": "Marketing",
  "Design (UI/UX, Product Design, Brand)": "Design",
  "Customer Support": "Customer Support",
  "Engineering (Software, Mobile, Backend, Frontend, DevOps, QA)": "Engineering",
  "Compliance": "Compliance",
};

const LEVEL_MAP = {
  "Junior / Entry-level (0–2 years in function)": "Junior (0-2 yrs)",
  "Mid-level (2–4 years in function)": "Mid-level (2-4 yrs)",
  "Senior (4–8 years in function)": "Senior (4-8 yrs)",
  "Lead / Staff (6–10 years in function)": "Lead/Staff (6-10 yrs)",
  // Senior Manager / Principal sits in the lead band — closest canonical level.
  "Senior Manager / Principal": "Lead/Staff (6-10 yrs)",
  "Director": "Director",
};

const WORK_MAP = {
  "Fully remote": "Fully remote",
  "Hybrid": "Hybrid",
  "Fully in-onsite": "Fully in-office",
  "Fully in-office": "Fully in-office",
  "": null,
};

const KNOWN_INDUSTRIES = [
  "Fintech", "Financial Services", "SaaS", "E-commerce", "Healthtech", "HRTech",
  "Edtech", "Logistics", "Consulting", "Public Sector", "Telecoms",
  "Pharmaceuticals", "Media & Entertainment", "Legal", "Maritime", "Other",
];
const INDUSTRY_MAP = {
  "Consulting / Professional services": "Consulting",
  "HR Tech": "HRTech",
  "HRTech": "HRTech",
  "Film Tech": "Media & Entertainment",
};

const STAGE_MAP = {
  "Pre-seed": "Pre-seed", "Seed": "Seed", "Series A": "Series A", "Series B": "Series B",
  "Series C or beyond": "Series C+", "Series C+": "Series C+", "Public": "Public",
  "Bootstrapped": "Bootstrapped", "Never raised": "Bootstrapped",
  "Startup": "Other", "NGO or Non-profit": "Other", "Nil": null, "Its a Law Firm": null, "": null,
};

const CURRENCY_MAP = {
  "Nigerian Naira (NGN)": "NGN", "British Pound (GBP)": "GBP", "US Dollar (USD)": "USD",
  "USDT": "USDT", "Euro (EUR)": "EUR", "Canadian Dollar (CAD)": "CAD",
};

const notes = [];

function cleanSalaries(rawGross, rawNet, currency, id) {
  let gross = rawGross === "" ? null : Math.round(parseFloat(rawGross.replace(/,/g, "")) * 100) / 100;
  let net = rawNet === "" ? null : Math.round(parseFloat(rawNet.replace(/,/g, "")) * 100) / 100;
  if (Number.isNaN(gross)) gross = null;
  if (Number.isNaN(net)) net = null;

  if (currency === "NGN") {
    const thousands = (v, label) => {
      if (v !== null && v >= 100 && v < 30000) {
        notes.push(`${id}: ${label} ${v} read as thousands → ${v * 1000}`);
        return v * 1000;
      }
      return v;
    };
    gross = thousands(gross, "gross");
    net = thousands(net, "net");

    if (gross !== null && net !== null && gross !== net && gross / net >= 8) {
      const monthly = gross / 12;
      if (monthly / net >= 0.7 && monthly / net <= 1.3) {
        notes.push(`${id}: gross ${gross.toLocaleString()} read as annual → ${Math.round(monthly).toLocaleString()}/mo`);
        gross = Math.round(monthly);
      }
    }
    if (gross !== null && net !== null && gross === net && gross >= 10000000) {
      notes.push(`${id}: gross=net ${gross.toLocaleString()} read as annual pair → ${Math.round(gross / 12).toLocaleString()}/mo`);
      gross = Math.round(gross / 12);
      net = Math.round(net / 12);
    }
    const bound = (v, label) => {
      if (v !== null && (v < 30000 || v > 20000000)) {
        notes.push(`${id}: ${label} ${v.toLocaleString()} outside sanity bounds → nulled (REVIEW)`);
        return null;
      }
      return v;
    };
    gross = bound(gross, "gross");
    net = bound(net, "net");
  } else {
    // Foreign currency: detect annual gross against monthly net (post-tax ratio 1.0–2.5).
    if (gross !== null && net !== null && gross / net >= 10) {
      const monthly = gross / 12;
      if (monthly / net >= 1.0 && monthly / net <= 2.5) {
        notes.push(`${id}: ${currency} gross ${gross.toLocaleString()} read as annual → ${Math.round(monthly).toLocaleString()}/mo`);
        gross = Math.round(monthly);
      }
    }
  }
  if (gross !== null) gross = Math.round(gross);
  if (net !== null) net = Math.round(net);
  return { gross, net };
}

const records = rows.slice(1).map((r) => {
  const id = r[C.id];
  const currency = CURRENCY_MAP[r[C.currency]];
  if (!currency) { console.error(`${id}: unknown currency "${r[C.currency]}"`); process.exit(1); }
  const fn = FUNCTION_MAP[r[C.fn]];
  if (!fn) { console.error(`${id}: unknown function "${r[C.fn]}"`); process.exit(1); }
  const level = LEVEL_MAP[r[C.level]];
  if (!level) { console.error(`${id}: unknown level "${r[C.level]}"`); process.exit(1); }
  if (r[C.level] === "Senior Manager / Principal") notes.push(`${id}: level "Senior Manager / Principal" mapped to Lead/Staff`);

  let industry = r[C.industry].trim();
  industry = INDUSTRY_MAP[industry] ?? industry;
  if (!KNOWN_INDUSTRIES.includes(industry)) {
    notes.push(`${id}: industry "${r[C.industry]}" mapped to Other`);
    industry = "Other";
  }

  const stageRaw = r[C.stage].trim();
  const stage = stageRaw in STAGE_MAP ? STAGE_MAP[stageRaw] : (notes.push(`${id}: stage "${stageRaw}" mapped to Other`), "Other");

  const { gross, net } = cleanSalaries(r[C.gross], r[C.net], currency, id);

  const benefits = BENEFIT_COLS.filter(([i]) => r[i] === "true").map(([, label]) => label);

  return {
    id,
    source: "pulse_2026",
    source_label: "Pulse (2026)",
    function: fn,
    role_level: level,
    gender: r[C.gender] || null,
    location: r[C.location] || null,
    work_arrangement: WORK_MAP[r[C.work]] ?? null,
    industry,
    company_stage: stage,
    company_size: r[C.size] ? r[C.size].replace(/–/g, "-").replace(/,/g, "") : null,
    currency,
    monthly_gross: gross,
    monthly_net: net,
    negotiated: r[C.negotiated] || null,
    benefits: benefits.length ? benefits.join(", ") : null,
    year: 2026,
    submission_date: r[C.date] ? r[C.date].slice(0, 10) : null,
  };
});

// Replace the pulse_2026 cohort; keep all other sources untouched.
const seedPath = join(root, "data", "seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf8"));
const kept = seed.filter((r) => r.source !== "pulse_2026");
const replaced = seed.length - kept.length;
const out = [...kept, ...records];
writeFileSync(seedPath, JSON.stringify(out, null, 2) + "\n");

console.log(`Ingested ${records.length} Tally submissions (replaced ${replaced} previous pulse_2026 records).`);
console.log(`Dataset: ${out.length} total records.`);
if (notes.length) {
  console.log(`\nCleaning notes (${notes.length}):`);
  notes.forEach((n) => console.log(`  - ${n}`));
}
