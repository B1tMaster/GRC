# Evonix GRC — Product Roadmap

**Tagline:** End day-zero legacy. Start living governance.

**Last Updated:** 2026-03-30

---

## Vision

Evonix replaces day-zero legacy with a living system — built on your organisation's context, powered by adversarial AI agents bound to each line of defence, fed by every format your board produces, and running on a continuous heartbeat of risk and control assurance.

---

## Roadmap Overview

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5
  NOW      NEXT         FUTURE      FUTURE      VISION

Annual     3LoD Agent   Risk        Control     Continuous
Report     Separation   Architecture Library &   Monitoring &
Ingestion  & Adversarial Ingestion   RCSA        The Heartbeat
           Dynamics
```

### Land-and-Expand Path

```
Day 1:    Upload annual report → governance map in 37 minutes (zero integration)
Month 1:  Connect internal policies → continuous gap monitoring
Month 3:  Connect regulatory feeds → real-time compliance posture
Month 6:  Full 3LoD platform with challenge flows, approvals, evidence repository
```

---

## Information Architecture (4 Tiers)

| Tier | What | Source Documents | Phase |
|------|------|-----------------|-------|
| **1. Organisation Context** | What the board committed to | Annual reports, board circulars, strategy documents | Phase 1 |
| **2. Risk Architecture** | How risk is structured and scored | ERMF, risk matrix, ORMF, risk taxonomy | Phase 3 |
| **3. Control Architecture** | What controls exist and how they operate | Control library, policies, procedures, RCSAs | Phase 4 |
| **4. Evidence & Monitoring** | What's actually happening | Incident data, KRI/KCI trends, audit findings, regulatory feeds | Phase 5 |

---

## Phase 1: Annual Report Ingestion & Governance Extraction

**JIRA:** [EVX-44](https://sydsoft.atlassian.net/browse/EVX-44)
**Status:** In Progress — core pipeline operational
**Timeline:** Current

### What It Does

Single-agent pipeline: ingest PDF → extract governance objectives → extract risk appetite → derive controls → gap analysis → policy drafts. Full audit trail.

### Key Results

| Document | Pages | Time | Objectives | Controls | Gaps | Drafts |
|----------|-------|------|------------|----------|------|--------|
| HSBC AR 2025 | ~400 | ~15 min | 19 | 105 | 10 | 7 |
| NVIDIA 10-K 2025 | ~100 | ~30 min | 14 | 76 | 9 | 9 |
| Samsung AR 2024 | ~80 | ~19 min | 4 | 25 | 10 | 10 |
| Berkshire 10-K 2024 | ~272 | ~37 min | 17 | 84 | 10 | 10 |
| **Total** | **~852** | **~101 min** | **54** | **290** | **39** | **36** |

Manual equivalent: ~6 months of analyst work. Cost: $27K–$61K per document. Evonix: <$2.

### Remaining Work

- Pipeline performance optimisation (parallel execution)
- Progress bar / real-time status UX
- Error handling hardening
- Additional document type testing

---

## Phase 2: 3LoD Agent Separation & Adversarial Dynamics

**JIRA:** [EVX-45](https://sydsoft.atlassian.net/browse/EVX-45)
**Status:** Planning
**Depends on:** Phase 1 complete

### The Core Idea

Decompose the monolithic pipeline into three distinct AI agents, each with a BMAD-style persona definition: identity, principles, communication style, and boundaries they don't cross.

### Why Agents ≠ Processes

| | Process | Agent |
|---|---|---|
| **Input → Output** | Deterministic, same every time | Contextual, adapts to organisation |
| **Judgment** | None — follows rules | Reasons about adequacy and sufficiency |
| **Challenge** | Can't challenge — just executes | Can disagree, explain why, escalate |
| **Learning** | Static until rules are updated | Incorporates new context each run |
| **Accountability** | "The system flagged this" | "The 2LoD agent challenged this because..." |

### Agent Definitions

**1LoD — Extraction Agent:**
- Mandate: Extract what the board committed to — binding obligations, not aspirational language
- Principles: Extract only what the document states. Source reference + confidence score for everything. Never cross into challenge or assurance.
- Boundary: Does not perform gap analysis against external frameworks

**2LoD — Challenge Agent:**
- Mandate: Challenge 1LoD's work using regulatory frameworks and industry standards
- Principles: Assess correctness and completeness. Challenge adequacy and proportionality against stated risk appetite.
- Boundary: Does not own or execute controls

**3LoD — Assurance Agent:**
- Mandate: Test control effectiveness — design and operational
- Principles: Establish evidence. Clear pass/fail criteria. Generate assurance reports.
- Boundary: Does not design or remediate controls

### MVP Validation

Run current pipeline → run standalone 2LoD challenge agent against outputs → compare. Did the adversarial agent find anything the monolithic pipeline missed?

---

## Phase 3: Risk Architecture Ingestion

**JIRA:** [EVX-46](https://sydsoft.atlassian.net/browse/EVX-46)
**Status:** Future
**Depends on:** Phase 2

### New Document Types

- **ERMF** — risk taxonomy, risk categories, escalation thresholds
- **Risk Matrix** — likelihood × impact scoring, tolerance bands
- **ORMF** — operational risk categories, loss event types, KRI definitions

### What It Unlocks

The 3LoD agents move from reasoning about a single document to reasoning about the full risk landscape:

- 1LoD maps extracted objectives to the existing risk taxonomy
- 2LoD challenges whether controls are proportionate to the risk level using the risk matrix
- Gap analysis becomes: "Your ERMF says AI risk is HIGH/HIGH, but your controls are only detective — your risk matrix demands preventive controls at this level"

---

## Phase 4: Control Library & RCSA Ingestion

**JIRA:** [EVX-47](https://sydsoft.atlassian.net/browse/EVX-47)
**Status:** Future
**Depends on:** Phase 3

### New Data Types

- **Existing control library** — current controls, ownership, frequency, type
- **Internal policies & procedures** — how controls are executed
- **RCSAs** — control owners' self-assessments
- **Incident data & loss events** — historical operational risk events

### What It Unlocks

- 3LoD agent has real evidence to test against
- Say-do analysis becomes multi-layered: annual report says X, ERMF says Y, control library shows Z — where are the disconnects?
- RCSA challenge: "Control owner rated this as effective, but incident data shows 3 failures last quarter"

---

## Phase 5: Continuous Monitoring & The Heartbeat

**JIRA:** [EVX-48](https://sydsoft.atlassian.net/browse/EVX-48)
**Status:** Vision
**Depends on:** Phases 1-4

### The Heartbeat Cycle

```
Ingest → Analyse → Challenge → Assure → (loop)
  1LoD      1LoD      2LoD       3LoD
```

**Traditional GRC:** Annual RCSA cycle. Quarterly control testing. Point-in-time assurance.
**Evonix:** Always on. Always current. Every cycle produces an updated governance posture with audit trail.

### New Capabilities

- **Real-time regulatory feeds** — HKMA, MAS, EU AI Act, FCA, PRA. Gap analysis within 24 hours of new regulation.
- **Continuous document monitoring** — auto-ingest new reports, detect year-on-year governance posture drift.
- **KRI/KCI trend monitoring** — threshold breach alerting, predictive control failure detection.
- **Multi-modal input** — PDFs, board presentations, audio recordings, verbal briefings.
- **Executive narrative generation** — board reports in under 60 seconds.

### What It Unlocks

- "How has our risk posture changed since last quarter?" — answered in seconds
- "HKMA issued new guidance yesterday. What's our exposure?" — gap analysis in minutes
- "Prepare a board report on our top 10 risks" — generated in 60 seconds
- Competitive benchmarking: run peers' annual reports and compare governance posture

---

## Strategic Moat

Phase 1 is the **wedge** — zero integration, upload a PDF, get a governance map.

Phase 5 is the **destination** — continuous, always-on governance with adversarial 3LoD agents.

The annual report is the entry point. The platform is the moat.

No legacy GRC vendor can do this because:
- They impose **day-zero legacy** — rigid data models, deterministic workflows
- Evonix starts from **organisation context** — the board's own words, commitments, and risk disclosures
- Agents have **philosophy-bound reasoning** — not rule-based matching
- The adversarial dynamic is **structural** — cascaded from the top of the organisation, not ad hoc
- Every AI decision is **explainable** — rationale, sources, confidence scores, full audit trail

**End day-zero legacy. Start living governance.**
