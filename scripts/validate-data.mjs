// Pre-build validation for the static datasets.
// Fails the build on schema violations; prints warnings for outliers.
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SOURCES = ["community_2023", "community_2024", "pulse_2026"];
const CURRENCIES = ["NGN", "GBP", "USD", "USDT", "EUR", "CAD"];
const LEVELS = [
  "Junior (0-2 yrs)",
  "Mid-level (2-4 yrs)",
  "Senior (4-8 yrs)",
  "Lead/Staff (6-10 yrs)",
  "Director",
];
const NEGOTIATED = ["Yes", "No", "Sort of", null];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say", null];
// NGN monthly gross sanity bounds — flag, don't fail, so a reviewer decides.
const NGN_GROSS_MIN = 30_000;
const NGN_GROSS_MAX = 20_000_000;

const errors = [];
const warnings = [];

function validateFile(file) {
  const records = JSON.parse(readFileSync(join(root, "data", file), "utf8"));
  if (!Array.isArray(records)) {
    errors.push(`${file}: root is not an array`);
    return;
  }
  const ids = new Set();
  records.forEach((r, i) => {
    const at = `${file}[${i}]`;
    if (typeof r.id !== "string" || !r.id) errors.push(`${at}: missing id`);
    else if (ids.has(r.id)) errors.push(`${at}: duplicate id ${r.id}`);
    else ids.add(r.id);

    if (!SOURCES.includes(r.source)) errors.push(`${at}: bad source "${r.source}"`);
    if (!LEVELS.includes(r.role_level)) errors.push(`${at}: bad role_level "${r.role_level}"`);
    if (!CURRENCIES.includes(r.currency)) errors.push(`${at}: bad currency "${r.currency}"`);
    if (!NEGOTIATED.includes(r.negotiated)) errors.push(`${at}: bad negotiated "${r.negotiated}"`);
    if (typeof r.function !== "string" || !r.function) errors.push(`${at}: missing function`);
    if (typeof r.year !== "number" || r.year < 2020 || r.year > 2100) errors.push(`${at}: bad year ${r.year}`);
    // Gender is retained for aggregate equity analysis. It must never be
    // rendered in record-level views or shipped to the client — enforced by
    // keeping the dataset server-side (lib/data.ts) and excluding gender from
    // display-row projections.
    if (!GENDERS.includes(r.gender)) errors.push(`${at}: bad gender "${r.gender}"`);

    for (const f of ["monthly_gross", "monthly_net"]) {
      if (r[f] !== null && (typeof r[f] !== "number" || r[f] <= 0)) errors.push(`${at}: ${f} must be a positive number or null`);
    }
    if (r.monthly_gross === null && r.monthly_net === null) warnings.push(`${at}: no salary data at all`);
    if (r.currency === "NGN" && r.monthly_gross !== null) {
      if (r.monthly_gross < NGN_GROSS_MIN || r.monthly_gross > NGN_GROSS_MAX) {
        warnings.push(`${at}: NGN gross ${r.monthly_gross.toLocaleString()} outside sanity bounds — verify before publishing`);
      }
      if (r.monthly_net !== null && r.monthly_net > r.monthly_gross) {
        warnings.push(`${at}: net (${r.monthly_net}) exceeds gross (${r.monthly_gross})`);
      }
    }
  });
  console.log(`${file}: ${records.length} records checked`);
}

validateFile("seed.json");
validateFile("community_2024.json");

warnings.forEach((w) => console.warn(`WARN  ${w}`));
if (errors.length) {
  errors.forEach((e) => console.error(`ERROR ${e}`));
  console.error(`\nData validation failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`Data validation passed (${warnings.length} warning(s)).`);
