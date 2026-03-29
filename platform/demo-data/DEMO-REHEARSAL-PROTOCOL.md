# Evonix GRC — Demo Rehearsal Protocol

## Pre-Demo Checklist

### Infrastructure (15 min before)
- [ ] Railway services all show **Active** (platform, zerox-service, minio, postgres, redis)
- [ ] `curl $RAILWAY_URL/api/users/me` returns 401 (API reachable)
- [ ] Netlify frontend loads at `https://evonix-grc.netlify.app`
- [ ] Frontend can reach backend (check browser console for CORS errors)

### Data (30 min before)
- [ ] Run `./demo-data/seed-demo.sh` against Railway URL
- [ ] Confirm HSBC Annual Report appears in Payload Admin → Annual Reports
- [ ] Confirm `parsedText` field has ~94K chars of content
- [ ] Confirm `extractionStatus` = "parsed"

### LLM Keys
- [ ] DeepSeek API key is valid: check Railway env `DEEPSEEK_API_KEY`
- [ ] Redis is reachable (pipeline cache)

---

## Demo Script

### Act 1: "The Problem" (2 min)
1. Open the HSBC Annual Report PDF (show it's 372 pages)
2. Explain: "Banks must extract governance obligations from thousands of pages of documents, map them to regulatory frameworks, find gaps, and draft policies. Today this takes weeks of manual work."

### Act 2: "The Solution" (5 min)
1. Show the Payload Admin panel — document already ingested
2. Trigger the GRC pipeline:
   - Navigate to Payload Admin → Pipeline Runs → Create New
   - Or POST to `/api/grc-extraction/start` with the document ID
3. Show the pipeline running (jobs queue in Payload Admin → Jobs)

### Act 3: "The Results" (5 min)
While pipeline runs (~3-5 min for 20 pages), walk through:
1. **Governance Objectives** extracted from the report
2. **Framework Mappings** — COBIT 2019, COSO ERM controls matched
3. **Control Objectives** derived from governance objectives
4. **Risk Appetite Statements** extracted
5. **Gap Analysis** — policy gaps identified against framework requirements
6. **Policy Drafts** — AI-generated policy recommendations

### Act 4: "Audit Trail" (1 min)
Show the Audit Trail Entries and Decision Logs — full traceability of every AI decision.

---

## Known Limitations (be transparent)

| Area | Limitation | Mitigation |
|------|-----------|------------|
| Document size | Pages 1-20 of 372 used for demo | Explain chunking roadmap (EVX-32) |
| Parse time | Zerox + Qwen takes 30-60 min for full doc | Demo uses pre-parsed text |
| LLM context | 120K char limit per extraction call | Sufficient for demo scope |
| Langfuse | Tracing may not be fully configured | Focus on Payload audit trail |

## Fallback Plan
If the live pipeline fails during demo:
1. Pre-run the pipeline before the demo starts
2. Walk through existing results in Payload Admin
3. Focus on the extracted data quality, not the real-time execution

## Post-Demo Reset
```bash
# Delete all pipeline-generated data (keep the base document)
# Use Payload Admin → bulk delete on:
# - Governance Objectives
# - Control Objectives
# - Risk Appetite Statements
# - Policy Gap Analyses
# - Policy Drafts
# - Decision Logs (for this trace)
# - Audit Trail Entries (for this trace)
```
