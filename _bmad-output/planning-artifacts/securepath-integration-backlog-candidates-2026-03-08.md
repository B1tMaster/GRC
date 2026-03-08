# SecurePath Integration — Backlog Candidates

**Date:** 2026-03-08  
**Purpose:** Candidate stories to operationalize SecurePath integration after schema validation.

---

## Candidate stories

| Priority | Story ID | Story | Est. (SP) |
|---|---|---|---|
| P0 | EVX-SP-01 | Build SecurePath connector auth + incremental sync framework | 5 |
| P0 | EVX-SP-02 | Implement canonical mapper for findings/remediation/evidence events | 8 |
| P0 | EVX-SP-03 | Map critical findings to CyberAlert + Incident linkage workflow | 8 |
| P0 | EVX-SP-04 | Preserve source trace in DecisionLog/AuditTrailEntry for replay | 5 |
| P1 | EVX-SP-05 | Add ingest latency and mapping coverage dashboard | 3 |
| P1 | EVX-SP-06 | Add schema drift detection + quarantine queue | 5 |
| P2 | EVX-SP-07 | Optional bi-directional sync (status updates back to SecurePath) | 8 |

---

## Story acceptance highlights

### EVX-SP-01
- Connector uses dedicated service identity and least-privilege scopes.
- Sync supports watermarking/cursor for incremental ingestion.

### EVX-SP-02
- Canonical events include `source_system`, `source_record_id`, `published_at`, `ingested_at`, normalized severity, and raw payload.
- Unknown/unsupported fields are retained in raw payload.

### EVX-SP-03
- High/critical findings create or update CyberAlert.
- Linkage rules connect to Incident and enforce risk/control references.

### EVX-SP-04
- Every SecurePath-derived recommendation includes source references in DecisionLog.
- Approval/challenge actions produce full AuditTrailEntry lineage.

### EVX-SP-05
- Dashboard shows ingest latency median/p95, mapping success %, and unresolved critical findings.

### EVX-SP-06
- Schema version mismatch triggers drift alert and quarantines records without data loss.

### EVX-SP-07
- Write-back updates are role-gated and auditable.
- Failure fallback leaves Evonix as source of truth until reconciliation succeeds.

---

## Suggested sequencing

1. SP-01 -> SP-02 (integration base)
2. SP-03 -> SP-04 (workflow + explainability)
3. SP-05 -> SP-06 (operational reliability)
4. SP-07 (only after read-first stability)

