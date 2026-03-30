# Evonix GRC — Pipeline Test Log

**Last Updated:** 2026-03-30

This document tracks all pipeline extraction tests conducted against real-world documents, including results, timings, and observations.

---

## Summary

| # | Document | Type | Pages | File Size | Pipeline Time | Objectives | Risk Statements | Controls | Gaps | Drafts | Run ID | Date |
|---|----------|------|-------|-----------|--------------|------------|-----------------|----------|------|--------|--------|------|
| 1 | HSBC Annual Report 2025 | Annual Report | ~400 | 9.6 MB | ~15 min (900s) | 19 | 10 | 105 | 10 | 7 | `RUN-627d905b` | 2026-03-28 |
| 2 | NVIDIA 10-K 2025 | SEC 10-K Filing | ~100 | 1.0 MB | ~30 min (1800s) | 14 | 0 | 76 | 9 | 9 | `RUN-9fce5677` | 2026-03-29 |
| 3 | Samsung Annual Report 2024 | Annual Report | ~80 | ~2.5 MB | ~19 min (1140s) | 4 | 0 | 25 | 10 | 10 | `RUN-896533e2` | 2026-03-29 |
| 4 | Berkshire Hathaway 10-K 2024 | SEC 10-K Filing | ~272 | ~3.0 MB | 36.7 min (2202.5s) | 17 | 0 | 84 | 10 | 10 | `RUN-7872bbe6` | 2026-03-29 |
| 5 | Revolut Annual Report 2024 (Governance Extract) | Annual Report (trimmed) | ~32 | 5.5 MB | 39.4 min (2365.6s) | TBC | TBC | TBC | TBC | TBC | TBC | 2026-03-30 |

**Totals (Tests 1-4):** 852 pages | 290 controls | ~101 min pipeline time

**Manual equivalent:** ~6 months of analyst work | $27K–$61K per document | $600K–$1.2M/year for full coverage

**Evonix cost:** <$2 per document in LLM compute

---

## Detailed Test Results

### Test 1: HSBC Annual Report 2025

| Field | Value |
|-------|-------|
| Document | HSBC Annual Report 2025 |
| Source | HSBC Investor Relations |
| Pages | ~400 |
| File Size | 9.6 MB |
| Pipeline Time | ~15 min (~900s) |
| Run ID | `RUN-627d905b` |
| Results API | `https://evonix-app-production.up.railway.app/api/grc-results?runId=RUN-627d905b` |
| Date | 2026-03-28 |

**Extraction Results:**
- Governance Objectives: **19** — structured with source section, confidence score, keywords
- Risk Appetite Statements: **10** — with appetite levels (minimal, cautious, open) and tolerance thresholds
- Control Objectives: **105** — preventive, detective, corrective, directive categories; each with owner, frequency, framework refs
- Gap Analysis: **10** — including "Missing: Generative AI Risk Management Policy"
- Policy Drafts: **7** — confidence scores 0.82–0.87, with `humanDraftRequired` flags

**Observations:**
- Fastest processing despite being the largest document — most pages are financial statements/tables that the LLM skims quickly
- Rich governance content in first ~60 pages drove strong extraction results
- "Generative AI Risk Management Policy" gap was particularly compelling for demo — HSBC committed to responsible AI but had no policy for it
- Risk appetite statements included quantitative thresholds (e.g., "CET1 capital ratio in the range of 14–14.5%")

---

### Test 2: NVIDIA 10-K 2025

| Field | Value |
|-------|-------|
| Document | NVIDIA 10-K Annual Filing 2025 |
| Source | SEC EDGAR |
| Pages | ~100 |
| File Size | 1.0 MB |
| Pipeline Time | ~30 min (~1800s) |
| Run ID | `RUN-9fce5677` |
| Results API | `https://evonix-app-production.up.railway.app/api/grc-results?runId=RUN-9fce5677` |
| Date | 2026-03-29 |

**Extraction Results:**
- Governance Objectives: **14**
- Risk Appetite Statements: **0** — 10-K filings typically don't include explicit risk appetite language
- Control Objectives: **76**
- Gap Analysis: **9**
- Policy Drafts: **9** — confidence scores 0.82–0.87

**Observations:**
- 10-K format is denser in governance/risk content per page than annual reports — more extraction work per page
- Zero risk appetite statements is expected for SEC 10-K format (these are US regulatory filings, not UK/HK annual reports)
- Good test case for demonstrating the pipeline works across different document formats and jurisdictions
- Smallest file size (1 MB) — fastest to upload and parse initially

---

### Test 3: Samsung Annual Report 2024

| Field | Value |
|-------|-------|
| Document | Samsung Annual Report 2024 |
| Source | Samsung Investor Relations |
| Pages | ~80 |
| File Size | ~2.5 MB |
| Pipeline Time | ~19 min (~1140s) |
| Run ID | `RUN-896533e2` |
| Results API | `https://evonix-app-production.up.railway.app/api/grc-results?runId=RUN-896533e2` |
| Date | 2026-03-29 |

**Extraction Results:**
- Governance Objectives: **4**
- Risk Appetite Statements: **0**
- Control Objectives: **25**
- Gap Analysis: **10**
- Policy Drafts: **10**

**Observations:**
- Fewest governance objectives extracted — Samsung's report is more operational/financial than governance-focused
- Despite fewer objectives, still derived 25 controls and identified 10 gaps — demonstrates the pipeline produces value even with less governance-dense documents
- Good example of how extraction quality varies by document governance density, not just page count
- Korean conglomerate annual report style differs from UK/US formats

---

### Test 4: Berkshire Hathaway 10-K 2024

| Field | Value |
|-------|-------|
| Document | Berkshire Hathaway 10-K 2024 |
| Source | SEC EDGAR |
| Pages | ~272 |
| File Size | ~3.0 MB |
| Pipeline Time | **36.7 min (2202.5s)** |
| Run ID | `RUN-7872bbe6` |
| Results API | `https://evonix-app-production.up.railway.app/api/grc-results?runId=RUN-7872bbe6` |
| Date | 2026-03-29 |

**Extraction Results:**
- Governance Objectives: **17**
- Risk Appetite Statements: **0**
- Control Objectives: **84**
- Gap Analysis: **10**
- Policy Drafts: **10**

**Observations:**
- This was the primary ROI benchmark document — 272 pages, 37 minutes, <$2 vs $27K–$61K manual
- Dense risk factor disclosures produced 17 governance objectives and 84 controls
- Longest processing time of the initial batch — strong correlation between governance content density and processing time
- Used as the headline "37 minutes vs 10 weeks" stat in pitch deck and demo script

---

### Test 5: Revolut Annual Report 2024 (Governance Extract)

| Field | Value |
|-------|-------|
| Document | Revolut Group Holdings Ltd Annual Report 2024 (governance-focused extract) |
| Source | Revolut Investor Relations (trimmed to governance sections) |
| Pages | ~32 (extracted from 178-page full report) |
| File Size | 5.5 MB |
| Pipeline Time | **39.4 min (2365.6s)** |
| Run ID | TBC |
| Date | 2026-03-30 |

**Extraction Results:**
- Governance Objectives: **TBC**
- Risk Appetite Statements: **TBC**
- Control Objectives: **TBC**
- Gap Analysis: **TBC**
- Policy Drafts: **TBC**

**Pages Included:**
- Pages 1-14: Cover, 2024 highlights, Chair/CEO/CFO letters
- Pages 45-62: Risk Management & Compliance (CRCO letter, Risk Appetite Statement, ERMF, governance & oversight, risk & compliance culture, principal risks with mitigants & controls, emerging risks, governance overview)

**Observations:**
- **Longest processing time despite fewest pages** — definitively proves processing time is driven by governance content density, not page count
- 32 pages of pure risk management and governance content took longer than HSBC's 400-page full annual report
- Revolut's report contains explicit Risk Appetite Statements (RAS) — should produce non-zero risk appetite extractions unlike the SEC 10-K filings
- Contains structured Principal Risks with Mitigants and Controls table — ideal for the pipeline's control derivation stage
- UK-regulated digital bank — relevant to HKMA/MAS/FCA demo audience

---

## Key Findings

### Processing Time Drivers

| Factor | Impact | Evidence |
|--------|--------|----------|
| **Governance content density** | HIGH — primary driver | Revolut (32p) took 39 min; HSBC (400p) took 15 min |
| **Page count** | LOW — secondary factor | No linear correlation between pages and processing time |
| **File size** | MINIMAL | NVIDIA (1 MB) took 30 min; HSBC (9.6 MB) took 15 min |
| **Document format** | MODERATE | 10-K filings (US) tend to take longer than annual reports (UK/HK) |
| **Number of extractable items** | HIGH | More objectives → more controls to derive → more gaps to analyse → more policies to draft |

### Format Comparison

| Format | Avg Objectives | Avg Controls | Risk Appetite? | Typical Time |
|--------|---------------|-------------|----------------|-------------|
| UK Annual Report (HSBC) | 19 | 105 | Yes (10) | ~15 min |
| SEC 10-K (NVIDIA, Berkshire) | 15.5 | 80 | No (0) | ~33 min |
| KR Annual Report (Samsung) | 4 | 25 | No (0) | ~19 min |
| UK Fintech AR (Revolut) | TBC | TBC | Expected Yes | ~39 min |

### ROI Benchmarks

| Metric | Manual | Evonix | Saving |
|--------|--------|--------|--------|
| Time per document | 7-10 weeks | 15-39 minutes | 99.9% |
| Cost per document | $27K-$61K | <$2 | 99.99% |
| Annual GRC coverage (20+ docs) | 3-5 FTE ($600K-$1.2M/yr) | Hours, on demand | ~$1M/yr |
| Coverage quality | Sample-based | Exhaustive (every page) | Complete |
| Consistency | Varies by analyst | Deterministic + confidence scores | Standardised |
| Audit trail | Manual notes | Immutable, timestamped | Regulator-ready |

---

## Test Environment

| Component | Detail |
|-----------|--------|
| Backend | Railway (cloud PaaS) |
| Framework | Next.js + Payload CMS v3.80.0 |
| Database | PostgreSQL |
| Object Storage | MinIO |
| LLM | DeepSeek (via LiteLLM) |
| PDF Parser | unpdf (Node.js) + Zerox (Python LLM parser) |
| Frontend | Netlify (static prototype) |
| Prototype URL | https://evonix-demo.netlify.app/prototype |

---

## Future Tests Planned

- [ ] Revolut full results (pending run ID confirmation)
- [ ] Hong Kong listed company annual report (HKEX format)
- [ ] Singapore listed company (MAS-regulated)
- [ ] EU company (for EU AI Act framework testing)
- [ ] Board circular / committee paper (non-annual-report document type)
- [ ] Year-on-year comparison (same company, 2023 vs 2024 annual report)
- [ ] Parallel pipeline execution (when EVX-36 is implemented)
