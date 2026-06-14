# Pulse Test Plan

**Purpose:** Verify that everything built or changed in this session works in prod and is genuinely usable. This document is the handover to the next agent, who will run regression + usability tests and return a test summary report.

**Reader:** The testing agent (cold-start; no memory of this session).

**Environment under test:** `https://pulse-wheat-six.vercel.app` (prod). Use the live URL. If a prod build is not yet live, see Section 2 — that's the first thing to verify.

---

## 1. In scope (what was built / changed)

Group these by area. Every regression case in Section 4 maps back to one of these.

### 1.1 Data & statistics
- Server-only data architecture. Raw dataset (`data/seed.json`, `data/community_2024.json`) is only imported by `lib/server-data.ts`; the `server-only` package enforces this at build time.
- 135 total records (87 community_2023 + 48 pulse_2026). 31 NGN gross-salary records in the 2026 cohort.
- `LATEST_YEAR = 2026`. All headline statistics default to 2026 data; 2023 is available as a historical view via explicit filter or the Compare opt-in checkbox.
- `MIN_SEGMENT_RECORDS = 5`. Every aggregate stat (by level, by industry, negotiation premium, take-home ratio) is gated behind this threshold. Below it, the segment is hidden, not shown with a misleading number.
- Negotiation premium: real computed value, no fallback. Cards only render when both negotiated and non-negotiated groups clear 5 records.
- Industry & location now display correctly in the Explore table (`coarsenForDisplay()` is a pass-through after the suppression bug fix).
- Currency symbol bug fixed: GBP, USD, EUR, CAD all render with their proper symbols (no fallback to ₦).
- StatCard count-up animation no longer corrupts compact-naira values (no more `₦589,000K`).

### 1.2 Privacy & data protection
- Gender field collected as optional, never published, never sent to the client. Stripped in `toDisplayRow()` before any API response.
- `/api/segment` returns only `{count, anchors: {p10,p25,p50,p75,p90}}` — the user's salary stays in their browser; `estimateRank()` computes the percentile client-side.
- `/api/aggregates` returns aggregates, breakdowns, distribution buckets, and coarsened recent rows. No raw records with sensitive fields.
- `/api/filter-options`: GET, force-static, dropdown values + total count only.

### 1.3 Pages

**Home (`/`)**
- Hero, live stats bar (2026 dataset), median salary by level chart, year-over-year cards showing the "+3% nominal / huge real-terms loss" story.

**Insights (`/insights`)**
- Hero
- "Who's in the data" composition section — 4 donuts (Function, Role level, Location, By year) + per-function progress bar against the 50-record target
- 7 data-driven insight cards (Flat naira / What negotiating gets you / Who negotiates? / Experience pays / How much you actually keep / Fintech leads / Benefits)
- Two pooled-data charts (negotiation by level, work arrangement)
- Benefits breakdown + ESOP guidance cards
- Trend section showing nominal medians by year
- Section divider between Who's in the data and the insight cards grid (fixed this session)

**Explore (`/explore`)**
- Year filter defaults to 2026. Warning shown when "all years (pooled)" is selected. Filters: year, level, industry, location, stage. Server-rendered initial state; client fetches `/api/aggregates` on filter change.

**Compare (`/compare`)**
- Currency + level + industry selectors. "Include 2023 historical records" checkbox with devaluation context. Salary input with currency prefix. Submit posts to `/api/segment` and renders a result state (above 75th / above median / below median) plus share CTAs.

**Contribute (`/contribute`)**
- Tally button (popup overlay, redirects to `/contribute?submitted=1` on completion). Per-function progress bar showing X/50. `ContributeSuccess` component renders post-submit with `track("tally_completed")` + share CTAs.

**Methodology (`/methodology`)**
- Data sources, what we measure, calculation method, anonymisation, limitations. All copy refined this session.

### 1.4 Analytics events
- `tally_open` (variant, method) — fires before opening Tally popup
- `tally_completed` — fires on mount of `ContributeSuccess`
- `salary_compared` (currency, level, industry, historical) — fires on Compare submit
- `share_click` (platform, source) — fires on share CTA click

### 1.5 Mobile UX
- 16px font size on selects and salary input (prevents iOS Safari auto-zoom on focus)
- 44px minimum touch target on buttons and selects
- Responsive padding (`@media (min-width: 640px)`) on surface-card, data-table, filter-select

### 1.6 OG image & metadata
- `app/opengraph-image.tsx` — edge-runtime ImageResponse, navy background, PULSE wordmark + EKG line.
- `metadataBase` set via `lib/site.ts` (reads `NEXT_PUBLIC_SITE_URL`, falls back to the Vercel URL).
- Viewport export (themeColor `#0B1120`, viewportFit `cover`).

### 1.7 UX copy refinement (this session)
- "WHO ANSWERED" → "WHO'S IN THE DATA"
- "Inside the 2026 dataset — 48 respondents so far" → "48 people shared their 2026 salary"
- Card title changes:
  - "The negotiation premium" → "What negotiating gets you"
  - "Junior to senior multiplier" → "Experience pays"
  - "Take-home ratio" → "How much you actually keep"
  - "Fintech leads the dataset" → "Fintech leads the data"
- Subtitles & chart captions simplified: "directional view" → "rough picture only", "level-by-level breakdowns" → "pay-by-level numbers", "Records by dataset year" → "By year", "Where the dataset needs you next" → "Where the data needs you next"
- Insight card bodies rewritten in plain language.
- All em dashes (`—`) removed from every `.ts`/`.tsx` file site-wide. En dashes (`–`) retained for numeric ranges (e.g. `0–2 yrs`) and for missing-value placeholders in tables.
- Section divider (`border-t border-gold/10`) added between Who's in the data and the insight cards grid so the bg-surface transition is no longer mushy.

### 1.8 Campaign content (drafts, not yet published)
Located in `pulse/campaign/`:
- `medium-article.md` — flagship piece, ~1,400 words
- `twitter-thread.md` — 8-tweet launch thread (contains 2 placeholder numbers — see Section 2)
- `linkedin-post.md` — two versions (launch + week-3 reshare)
- `dm-outreach.md` — 3 DM templates + 15 named targets + Slack/WhatsApp copy
- `media-pitch.md` — pitches for TechCabal / Communiqué / Benjamindada
- `README.md` — launch sequence + pre-publish checklist

---

## 2. Out of scope / outstanding

These are **not yet done**. The testing agent should NOT attempt them. Flag any of them in the test summary report if they affect a test outcome.

| # | Item | Owner | Why outstanding |
|---|------|-------|----------------|
| O1 | `git push origin main` of the empty trigger commit + the UX-copy commits | User | Push to main is blocked by auto-mode permissions; user must run it manually |
| O2 | Vercel auto-deploy of the 3 previously-blocked commits (cc173b0, f844380, 6432a43) plus this session's UX-copy changes | Vercel (auto) | Depends on O1 |
| O3 | Flip repo from public back to private after O2 succeeds | User | Manual GitHub action |
| O4 | Domain acquisition (recommendation: `getpulse.ng`) | User | External purchase |
| O5 | Set `NEXT_PUBLIC_SITE_URL` env var in Vercel | User | Depends on O4 |
| O6 | Replace `[pulse URL]` placeholders in all campaign docs | User | Depends on O4 |
| O7 | Fill in actual numbers in `twitter-thread.md` Tweets 3 and 4 (negotiation medians; junior/senior multiplier) | User | Numbers are now visible on `/insights` but the thread file still has placeholders |
| O8 | Tag Lola Soleye in LinkedIn post drafts | User | Account-level action |
| O9 | Publish any campaign asset to Medium / Twitter / LinkedIn | User | Pre-launch checklist not signed off |
| O10 | Send media pitches to TechCabal / Communiqué / Benjamindada | User | Pre-launch checklist not signed off |

---

## 3. Pre-flight (before any test runs)

1. Confirm Vercel deployment status. Visit `https://vercel.com/dashboard` → Pulse project → latest deployment. If the latest deploy is **older than commit `6432a43`** OR doesn't include the "Who's in the data" copy, **stop**. O1/O2 are unresolved; record this in the report and skip everything that depends on the new copy.
2. Confirm `https://pulse-wheat-six.vercel.app` loads without 500 errors.
3. Open DevTools → Console. Note any errors that fire on page load (warn-level Recharts sizing warnings during first paint are expected and not a failure).
4. Open DevTools → Network. Note any 4xx/5xx responses.

---

## 4. Regression test cases

Run all cases in **desktop Chrome (latest)** AND **iOS Safari (real device or simulator)**. Mark each as Pass / Fail / Blocked. For any Fail, capture URL + repro steps + screenshot.

### 4.1 Home (`/`)
| ID | Case | Expected |
|----|------|---------|
| R-H-01 | Page loads. | Hero, live stats bar, salary-by-level chart, year-over-year cards all render. |
| R-H-02 | "All-Time Data Points" stat shows 135. | Number matches `/insights` totals (135). |
| R-H-03 | "Median Monthly Gross (2026)" stat shows ₦600K with subtitle "31 NGN records with gross data". | Matches dataset. |
| R-H-04 | Year cards show 2023 (₦581K, 87 records) and 2026 (₦600K, ~31 NGN records). | Both render; copy reads naturally; no em dashes. |
| R-H-05 | "Add your numbers" CTA opens Tally popup. | Popup overlays page; analytics event `tally_open` fires (verify via Vercel Analytics dashboard or DevTools network tab → vitals endpoint). |

### 4.2 Insights (`/insights`)
| ID | Case | Expected |
|----|------|---------|
| R-I-01 | Hero copy reads "What the data reveals" + "Key findings from 135 compensation records. Every number below states which slice of the data it comes from. Nothing is shown with fewer than 5 records." | Matches exactly. No em dash. |
| R-I-02 | "Who's in the data" eyebrow + title "48 people shared their 2026 salary" + plain-language subtitle. | New copy from this session is live. |
| R-I-03 | Four composition donuts render: Function, Role level, Location, By year. | All four show data. Legend on right (desktop) or below (mobile). Largest slice is brand gold. |
| R-I-04 | "Where the data needs you next" per-function progress bar lists tracked functions sorted by largest gap first. | Largest gap (e.g. Marketing 6/50) appears above smaller gaps. |
| R-I-05 | 7 insight cards render: Flat naira, shrinking value / What negotiating gets you / Who negotiates? / Experience pays / How much you actually keep / Fintech leads the data / Benefits are part of the deal. | All titles match exactly. All show a numeric stat + basis label + body. No em dashes. |
| R-I-06 | **Section divider** is visible between the Who's in the data section (bg-bg-surface) and the insight cards grid (default bg). | Thin gold border-top above the cards. Padding above the cards is comfortable. |
| R-I-07 | Negotiation chart (lower section) renders levels only where both groups have ≥5 records. | Chart hides any level that fails the threshold. |
| R-I-08 | Work-arrangement chart renders with caption "All years combined. Rough picture only. Median monthly gross by work setup." | Matches exactly. |
| R-I-09 | Benefits breakdown chart shows percentages out of 2026 respondents. | Total respondents in caption matches the Who's in the data count. |
| R-I-10 | Trend section shows 2023 and 2026 nominal medians side by side. | Caption explains figures are not adjusted for inflation. |

### 4.3 Explore (`/explore`)
| ID | Case | Expected |
|----|------|---------|
| R-E-01 | Year filter defaults to `2026`. | First load shows 2026 stats. |
| R-E-02 | Filter to "All years (pooled)". | Gold warning appears: "2023 and 2026 salaries come from very different economic conditions, so treat pooled statistics with caution." |
| R-E-03 | Filter by Industry → Fintech. | Aggregate stats update; record table updates; no industry/location columns show "–" for records that have those values populated. |
| R-E-04 | Filter by Level → Senior. | byLevel breakdown updates; segments below 5 records are hidden. |
| R-E-05 | Reset button clears all filters and returns to 2026 default. | All dropdowns reset. |
| R-E-06 | Industry column and Location column populate with real values (Fintech, Lagos, Abuja, etc.). | No "–" placeholder for records where the underlying value exists (this was a session bug fix). |
| R-E-07 | Diaspora records (GBP/USD/EUR/CAD) appear in the table with correct currency symbol prefix (£/$/€/C$). | No ₦ prefix on non-NGN rows. |

### 4.4 Compare (`/compare`)
| ID | Case | Expected |
|----|------|---------|
| R-C-01 | Currency, Level, Industry selectors render. "Include 2023 historical records" checkbox is present with explanatory copy. | All controls render; copy reads naturally without em dashes. |
| R-C-02 | Enter salary `600000`, currency NGN. Submit. | Result state renders: percentile rank, anchor numbers, narrative card. |
| R-C-03 | DevTools Network → check the POST to `/api/segment`. | Request body contains level/industry/currency/historical — **does NOT contain the salary value**. |
| R-C-04 | Below 5-record segment (e.g. obscure level + industry combination). | Result tells the user there isn't enough data; does not show a misleading rank. |
| R-C-05 | "Share your result" CTAs render (WhatsApp / X / LinkedIn / Copy). | Click each → share URL composes with shareText including the percentile and segment label. |
| R-C-06 | Reset button returns to the input form. | Form is empty; previous segment state is cleared. |
| R-C-07 | Non-NGN currency (e.g. USD) shows the data-limited warning. | Copy reads: "USD data is limited, so results may not be statistically significant yet." |

### 4.5 Contribute (`/contribute`)
| ID | Case | Expected |
|----|------|---------|
| R-X-01 | Page loads with hero "The index is only as good as what people put in." | Trust signals list renders; per-function progress bar renders; "What the form asks" surface card lists 8 collected fields. |
| R-X-02 | Click "Add your numbers" / Tally button. | Tally popup overlays the page. `tally_open` event fires. |
| R-X-03 | Complete a test Tally submission and let it redirect. | URL becomes `/contribute?submitted=1`. `ContributeSuccess` component renders with the green checkmark, "Submission received" eyebrow, share CTAs, and "See where you stand" + "What the data reveals" links. `tally_completed` event fires. |
| R-X-04 | Click a share CTA on the success state. | Share URL composes with the contribute URL; `share_click` event fires with `source: "contribute_success"`. |
| R-X-05 | Refresh the success page (`/contribute?submitted=1`). | Page still renders the success state. `tally_completed` fires again (acceptable; Vercel Analytics dedups). |

### 4.6 Methodology (`/methodology`)
| ID | Case | Expected |
|----|------|---------|
| R-M-01 | Page loads with 5 numbered sections. | All sections render: data sources, what we measure, calculation, anonymisation, limitations. |
| R-M-02 | Data sources cards show "Community 2023" (87 records) and "Pulse 2026" (48 records). | Counts match. |
| R-M-03 | Attribution footer credits Ibraheem Agbaje + Lola Soleye. | Both names present. |
| R-M-04 | No em dashes anywhere on the page. | Plain punctuation throughout. |

### 4.7 OG image, metadata, viewport
| ID | Case | Expected |
|----|------|---------|
| R-O-01 | Hit `https://pulse-wheat-six.vercel.app/opengraph-image` directly. | OG image renders as a navy PNG, ~1200×630, with PULSE wordmark and EKG line. |
| R-O-02 | Paste the homepage URL into the LinkedIn Post Inspector OR `metatags.io`. | OG image, title "Pulse: Nigerian Tech Compensation Index", and description preview correctly. |
| R-O-03 | iOS Safari → load homepage. | Status bar takes the navy theme color. No layout shift on first paint. |

### 4.8 Mobile / responsive
| ID | Case | Expected |
|----|------|---------|
| R-MOB-01 | iOS Safari → /compare. Tap the salary input. | Input does **not** auto-zoom on focus (16px font enforces this). |
| R-MOB-02 | iOS Safari → /explore. Tap each filter dropdown. | Buttons feel comfortable to hit (44px min). No auto-zoom. |
| R-MOB-03 | iPhone SE viewport (375px) → /insights. | Composition donuts stack vertically; legends sit below each chart; no horizontal scroll. |
| R-MOB-04 | iPhone SE → /explore record table. | Table scrolls horizontally cleanly; cell padding is comfortable. |
| R-MOB-05 | Android Chrome → all pages. | No layout breakage; navigation hamburger opens correctly. |

### 4.9 Em dash sweep
| ID | Case | Expected |
|----|------|---------|
| R-D-01 | Open DevTools console on each page (`/`, `/insights`, `/explore`, `/compare`, `/contribute`, `/methodology`). Run: `(document.body.innerText.match(/—/g) \|\| []).length` | Returns `0` on every page. |

### 4.10 Analytics
| ID | Case | Expected |
|----|------|---------|
| R-A-01 | Open Vercel Analytics dashboard. Confirm events fire in real time during the test session. | `tally_open`, `tally_completed`, `salary_compared`, `share_click` all appear with correct properties. |

---

## 5. Usability test scenarios

Run with **3–5 testers** if available, otherwise one cold reviewer. Each scenario has a **task** and a **success signal**. Record time-to-completion, dead-ends, confused moments, and any verbatim reactions.

### 5.1 New visitor — "What is this?"
**Task:** Land on the homepage. Without clicking anything for 30 seconds, describe out loud what Pulse is, who it's for, and what you'd do next.

**Success:**
- Tester correctly identifies it as a Nigerian tech salary index within 15 seconds.
- Tester volunteers at least one of: compare my salary, see the data, contribute.

**Watch for:** confusion about whether the site is selling something, asking for an account, or whether the data is real.

### 5.2 Negotiating professional — "Am I underpaid?"
**Task:** "You're a Senior Engineer in fintech, Lagos, earning ₦600K monthly. Use Pulse to figure out whether that's competitive."

**Success:**
- Tester reaches a percentile result on `/compare` within 2 minutes.
- Tester can articulate what their percentile means.
- Tester notices the negotiation card on `/insights`.

**Watch for:** confusion about the "include historical" checkbox, the segment label, or what "above the median" actually means.

### 5.3 Curious browser — "What's the headline?"
**Task:** "Spend 90 seconds on `/insights`. Summarise the 3 most surprising findings."

**Success:**
- Tester identifies the flat-naira / shrinking-value story.
- Tester identifies the negotiation gap.
- Tester identifies either the seniority gap or the fintech dominance.

**Watch for:** card titles or bodies that the tester re-reads more than once. Anything they skip past.

### 5.4 Potential contributor — "How do I add my data?"
**Task:** "You decide your salary is worth sharing. Add it to Pulse."

**Success:**
- Tester finds the Tally form within 30 seconds (from any page).
- Tester completes the form (test submission allowed).
- Tester sees the success state and considers clicking a share CTA.

**Watch for:** hesitation about anonymity. If they re-read the trust signals or the methodology before submitting, note exactly where they paused.

### 5.5 Sceptical reader — "Should I trust this?"
**Task:** "A friend sent you Pulse and you're suspicious it's marketing or astroturf. Find out how the data was collected and decide if you trust the numbers."

**Success:**
- Tester reads `/methodology` and can correctly state: sample size, anonymity guarantee, the 5-record minimum, the 2023 vs 2026 distinction.

**Watch for:** any sentence on `/methodology` that the tester re-reads or asks about.

### 5.6 Mobile-only user
**Task:** Run any of 5.1–5.5 entirely on iPhone Safari (no laptop).

**Success:**
- Tester completes the task without complaining about tap targets, zoom, or layout.

**Watch for:** auto-zoom on form fields, scroll traps, anything that needs two-handed use.

---

## 6. Test summary report — template

Return this filled in.

```markdown
# Pulse — Test Summary Report

**Date:** [YYYY-MM-DD]
**Tester:** [name / role]
**Build under test:** [Vercel deployment URL + commit SHA]
**Devices:** [list — e.g. Chrome 142 / macOS 14, Safari iOS 18 on iPhone 13]

## 1. Headline result
- Pass / Pass with issues / Fail
- One paragraph (≤80 words) summarising the state of the build.

## 2. Regression results
| Case ID | Result | Notes |
|---------|--------|-------|
| R-H-01  | Pass   |       |
| ...     | ...    | ...   |

Summary: X/Y passed. Z failed. W blocked.

## 3. Failures (detailed)
For every Fail or Blocked from Section 2 above:
- **Case ID + title:**
- **Severity:** P0 (blocks launch) / P1 (must-fix before campaign) / P2 (track but don't block)
- **Steps to reproduce:**
- **Expected vs actual:**
- **Screenshot / network capture:**
- **Suggested owner:**

## 4. Usability findings
For each scenario in Section 5:
- **Scenario:**
- **Completion:** completed / partial / abandoned
- **Time to success:**
- **Friction points:** (verbatim quotes where possible)
- **Recommendations:**

## 5. Outstanding items observed
Did any item from Section 2 of the test plan (Out of scope / outstanding) affect a test? Flag here.

## 6. Recommendations before campaign launch
Ordered list, P0 → P2. Each item should be actionable in under a sentence.
```

---

## 7. Stop conditions

Stop testing and escalate immediately if any of these happen:
- The build under test is older than commit `6432a43` (the UX-copy and divider changes are not present).
- `/api/segment` is returning the user's submitted salary in the request body.
- Gender field is appearing anywhere in HTML, API responses, or DevTools storage.
- The site is throwing 500 errors on any of the six main pages.
- The Tally popup fails to open from the primary CTA on more than one page.

These represent privacy / data-protection failures and should be reported as P0 with no further testing required to confirm them.
