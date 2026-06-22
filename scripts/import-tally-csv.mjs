/**
 * Convert Tally CSV export to Pulse seed JSON.
 * Usage: node scripts/import-tally-csv.mjs path/to/file.csv
 * Output: data/pulse_2026.json
 */
import { readFileSync, writeFileSync } from "fs";
import { randomBytes } from "crypto";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseCsvLine(line) {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (vals[i] ?? "").trim();
    });
    return obj;
  });
}

// Map Tally column values to Pulse schema
const FUNCTION_MAP = {
  "Product Management": "Product Management",
  "Engineering (Software, Mobile, Backend, Frontend, DevOps, QA)": "Engineering",
  "Design (UI/UX, Product Design, Brand)": "Design",
  "Data (Analytics, Data Science, Data Engineering)": "Data",
  "Marketing (Growth, Content, Brand, Performance)": "Marketing",
  "Sales & Business Development": "Sales & Business Development",
  "Operations (Business Ops, Product Ops, Project Management)": "Operations",
  "Finance & Accounting": "Finance",
  "People / HR": "People/HR",
  "Legal": "Legal",
  "Customer Support": "Customer Success",
  "Customer Success": "Customer Success",
  "Management Consulting": "Operations",
  "Compliance": "Legal",
};

const LEVEL_MAP = {
  "Junior / Entry-level (0–2 years in function)": "Junior (0-2 yrs)",
  "Mid-level (2–4 years in function)": "Mid-level (2-4 yrs)",
  "Senior (4–8 years in function)": "Senior (4-8 yrs)",
  "Lead / Staff (6–10 years in function)": "Lead\\Staff (6-10 yrs)",
  "Senior Manager / Principal": "Lead\\Staff (6-10 yrs)",
  "Director": "Director",
};

const CURRENCY_MAP = {
  "Nigerian Naira (NGN)": "NGN",
  "US Dollar (USD)": "USD",
  "British Pound (GBP)": "GBP",
  "Euro (EUR)": "EUR",
  "Canadian Dollar (CAD)": "CAD",
  "USDT": "USD",
};

const ARRANGEMENT_MAP = {
  "Fully remote": "Remote (Nigeria)",
  "Hybrid": "Hybrid",
  "Fully in-onsite": "On-site",
};

function parseNumber(val) {
  if (!val) return null;
  const cleaned = val.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

function mapNegotiated(val) {
  if (!val) return null;
  if (val === "Yes") return "Yes";
  if (val === "No") return "No";
  if (val.toLowerCase().includes("sort of")) return "Sort of";
  return null;
}

function mapNegotiationOutcome(val) {
  if (!val) return null;
  if (val.includes("exactly what I asked for")) return "Got what I asked for";
  if (val.includes("partially more")) return "Got partially more";
  if (val.includes("accepting less")) return "Accepted less";
  if (val.includes("stayed the same")) return "Offer stayed the same";
  return val;
}

function parseBenefits(row) {
  const benefitKeys = [
    ["Health insurance — individual cover", "Health insurance (individual)"],
    ["Health insurance — family cover", "Health insurance (family)"],
    ["Employer pension / RSA contributions", "Pension"],
    ["Internet or data allowance", "Internet/data allowance"],
    ["Device provided or equipment stipend", "Device/equipment"],
    ["Learning & development budget", "L&D budget"],
    ["Transport allowance", "Transport allowance"],
    ["Housing allowance", "Housing allowance"],
    ["Meal allowance", "Meal allowance"],
    ["Gym or wellness benefit", "Gym/wellness"],
    ["Remote work / home office stipend", "Remote work stipend"],
    ["Paid parental leave", "Paid parental leave"],
    ["Annual leave above the statutory minimum", "Extra annual leave"],
    ["Visa or relocation support", "Visa/relocation"],
    ["Annual or biannual flight tickets", "Flight tickets"],
  ];

  const benefits = [];
  for (const [tallyKey, label] of benefitKeys) {
    const colName = `Beyond salary, what else do you receive? (${tallyKey})`;
    if (row[colName] === "true") {
      benefits.push(label);
    }
  }

  // Also check the combined column
  const combined = row["Beyond salary, what else do you receive?"] ?? "";
  if (combined && !combined.includes("None of the above") && benefits.length === 0) {
    return combined;
  }

  return benefits.length > 0 ? benefits.join(", ") : null;
}

function mapLocation(val, row) {
  if (!val) return "Lagos";
  if (val === "UK" || val === "United Kingdom") return "Outside Nigeria";
  if (val === "US" || val === "USA" || val === "United States") return "Outside Nigeria";
  if (val === "Canada") return "Outside Nigeria";
  if (val === "Other Nigeria") return "Other Nigeria";
  return val;
}

function mapWorkArrangement(val, location) {
  if (!val) return "On-site";
  const mapped = ARRANGEMENT_MAP[val];
  if (!mapped) return val;
  if (mapped === "Remote (Nigeria)" && (location === "Outside Nigeria")) {
    return "Remote (International)";
  }
  return mapped;
}

function mapIndustry(val) {
  if (!val) return null;
  const map = {
    "Fintech": "Fintech",
    "Financial Services": "Financial Services",
    "SaaS": "SaaS",
    "E-commerce": "E-commerce",
    "Healthtech": "Healthtech",
    "HRTech": "HRTech",
    "HR Tech": "HRTech",
    "Edtech": "Edtech",
    "Logistics": "Logistics",
    "Consulting / Professional services": "Consulting",
    "Public Sector": "Public Sector",
    "Telecoms": "Telecoms",
    "Pharmaceuticals": "Pharmaceuticals",
    "Media & Entertainment": "Media & Entertainment",
    "Legal": "Legal",
    "Maritime": "Maritime",
    "Film Tech": "Media & Entertainment",
    "CaaS": "SaaS",
    "Capacity Building": "Other",
    "developer focused product": "SaaS",
  };
  return map[val] ?? "Other";
}

function mapCompanyStage(val) {
  if (!val) return null;
  const map = {
    "Bootstrapped": "Bootstrapped",
    "Pre-seed": "Pre-seed",
    "Seed": "Seed",
    "Series A": "Series A",
    "Series B": "Series B",
    "Series C or beyond": "Series C+",
    "Public": "Public",
    "Never raised": "Bootstrapped",
    "Startup": "Pre-seed",
  };
  return map[val] ?? "Other";
}

function mapCompanySize(val) {
  if (!val) return null;
  const map = {
    "1–10": "1-10",
    "11–50": "11-50",
    "51–200": "51-200",
    "201–500": "201-500",
    "500–1,000": "500-1000",
    "1,000+": "1000+",
  };
  return map[val] ?? val;
}

function convertRow(row) {
  const func = FUNCTION_MAP[row["What function do you work in?"]] ?? "Other";
  const level = LEVEL_MAP[row["What is your role level?"]] ?? row["What is your role level?"] ?? "Mid-level (2-4 yrs)";
  const currency = CURRENCY_MAP[row["What currency are you primarily paid in?"]] ?? "NGN";
  const rawLocation = row["Where are you currently based?"];
  const location = mapLocation(rawLocation, row);
  const workArr = mapWorkArrangement(row["How do you currently work?"], location);

  let grossRaw = parseNumber(row["What is your monthly GROSS salary? (Before tax and deductions)"]);
  let netRaw = parseNumber(row["What is your monthly NET salary? (What actually hits your account)"]);

  // Fix obvious data entry issues
  // Values under 1000 for NGN are likely in thousands
  if (currency === "NGN") {
    if (grossRaw && grossRaw < 1000) grossRaw = grossRaw * 1000;
    if (netRaw && netRaw < 1000) netRaw = netRaw * 1000;
  }

  const negotiated = mapNegotiated(row["Did you negotiate your salary for this role?"]);
  const negotiationOutcome = mapNegotiationOutcome(row["How did the negotiation go"]);

  const hasEquityRaw = row["Equity / stock options"];
  const hasEquity = hasEquityRaw === "Yes";

  const hasBonusRaw = row["Do you receive an annual performance bonus?"];
  const hasBonus = hasBonusRaw === "Yes";

  const bonusRange = row["Bonus (if Yes):"] || null;

  const foreignEmployer = row["Are you employed by a foreign company while based in Nigeria?"] === "Yes";
  const hqInNigeria = row["Is your company Nigerian-founded?"] === "Yes";

  return {
    id: randomBytes(4).toString("hex"),
    source: "pulse_2026",
    source_label: "Pulse (2026)",
    function: func,
    role_level: level,
    job_title: row["What is your job title?"]?.trim() || null,
    years_experience: row["Total years of work experience"] || row["How many years have you worked in your current function?"] || null,
    gender: row["What is your gender?"] || null,
    age_range: row["What is your age range?"] || null,
    satisfaction: parseNumber(row["Compensation satisfaction score"]) || null,
    education: row["Highest education level"] || null,
    location,
    work_arrangement: workArr,
    currency,
    monthly_gross: grossRaw,
    monthly_net: netRaw,
    company_name: null,
    foreign_employer: foreignEmployer,
    industry: mapIndustry(row["What industry does your company primarily operate in?"]),
    company_stage: mapCompanyStage(row["What stage is your company at?"]),
    company_size: mapCompanySize(row["How many people work at your company?"]),
    company_age: row["How old is your company?"] || null,
    headquartered_in_nigeria: hqInNigeria,
    company_hq: row["Where is your company headquartered?"] || null,
    team_size: row["Team size (your direct function)"] || null,
    manage_others: row["Do you manage others?"] === "Yes",
    report_to: row["Who do you directly report to?"] || null,
    negotiated,
    negotiation_outcome: negotiationOutcome,
    has_bonus: hasBonus,
    bonus_range: bonusRange,
    has_equity: hasEquity,
    benefits: parseBenefits(row),
    confirmed_currency: null,
    multi_currency: false,
    year: 2026,
    submission_date: row["Submitted at"] || null,
  };
}

// Main
const csvPath = process.argv[2];
if (!csvPath) {
  console.error("Usage: node scripts/import-tally-csv.mjs <path-to-csv>");
  process.exit(1);
}

const csvText = readFileSync(resolve(csvPath), "utf-8");
const rows = parseCsv(csvText);
console.log(`Parsed ${rows.length} rows from CSV`);

const records = rows.map(convertRow);

// Log any records with suspicious values
records.forEach((r, i) => {
  if (r.currency === "NGN" && r.monthly_gross && r.monthly_gross > 50000000) {
    console.warn(`Row ${i + 1}: unusually high NGN gross: ${r.monthly_gross} (${r.job_title})`);
  }
  if (r.currency === "NGN" && r.monthly_gross && r.monthly_gross < 50000) {
    console.warn(`Row ${i + 1}: unusually low NGN gross: ${r.monthly_gross} (${r.job_title})`);
  }
  if (!r.monthly_gross && !r.monthly_net) {
    console.warn(`Row ${i + 1}: no salary data (${r.job_title})`);
  }
});

const outPath = resolve(__dirname, "..", "data", "pulse_2026.json");
writeFileSync(outPath, JSON.stringify(records, null, 2));
console.log(`Wrote ${records.length} records to ${outPath}`);
