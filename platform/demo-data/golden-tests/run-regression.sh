#!/usr/bin/env bash
# Golden Document Regression Test Runner
# Loads a small board circular, runs the pipeline, and verifies output quality.
# Usage: PAYLOAD_URL=https://your-url EMAIL=admin@test.com PASSWORD=secret ./run-regression.sh

set -euo pipefail

PAYLOAD_URL="${PAYLOAD_URL:-http://localhost:3000}"
EMAIL="${EMAIL:?EMAIL required}"
PASSWORD="${PASSWORD:?PASSWORD required}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Golden Document Regression Test ==="
echo "Target: $PAYLOAD_URL"
PASS=0
FAIL=0

pass() { echo "  PASS: $1"; ((PASS++)); }
fail() { echo "  FAIL: $1"; ((FAIL++)); }

# Authenticate
TOKEN=$(curl -s -X POST "$PAYLOAD_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "FATAL: Authentication failed"
  exit 1
fi

# Load test document
echo ""
echo "Step 1: Loading golden test document..."
PARSED_TEXT=$(jq -Rs '.' < "$SCRIPT_DIR/small-board-circular.txt")

DOC_RESPONSE=$(curl -s -X POST "$PAYLOAD_URL/api/board-circulars" \
  -H "Authorization: JWT $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"REGRESSION TEST: ABC Bank Board Circular\",
    \"organization\": \"ABC Bank Holdings Limited\",
    \"meetingDate\": \"2026-01-15\",
    \"parsedText\": $PARSED_TEXT,
    \"extractionStatus\": \"parsed\"
  }")

DOC_ID=$(echo "$DOC_RESPONSE" | jq -r '.doc.id // empty')
if [ -z "$DOC_ID" ]; then
  echo "FATAL: Failed to create test document"
  echo "$DOC_RESPONSE" | jq .
  exit 1
fi
echo "Created test document (ID: $DOC_ID)"

# Trigger pipeline
echo ""
echo "Step 2: Triggering GRC pipeline..."
PIPELINE_RESPONSE=$(curl -s -X POST "$PAYLOAD_URL/api/grc-extraction/start" \
  -H "Authorization: JWT $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"documentType\": \"board-circulars\", \"documentId\": $DOC_ID}")

TRACE_ID=$(echo "$PIPELINE_RESPONSE" | jq -r '.traceId // .data.traceId // empty')
echo "Pipeline started (traceId: ${TRACE_ID:-unknown})"

# Wait for pipeline to complete
echo ""
echo "Step 3: Waiting for pipeline completion..."
for i in $(seq 1 30); do
  sleep 10
  STATUS=$(curl -s "$PAYLOAD_URL/api/board-circulars/$DOC_ID" \
    -H "Authorization: JWT $TOKEN" | jq -r '.extractionStatus // "unknown"')
  echo "  [$((i*10))s] Status: $STATUS"
  if [ "$STATUS" = "complete" ] || [ "$STATUS" = "error" ]; then
    break
  fi
done

# Verify outputs
echo ""
echo "Step 4: Verifying extraction results..."

# Check governance objectives
GOV_COUNT=$(curl -s "$PAYLOAD_URL/api/governance-objectives?where[sourceDocument.value][equals]=$DOC_ID&limit=0" \
  -H "Authorization: JWT $TOKEN" | jq '.totalDocs // 0')
echo ""
echo "Governance Objectives: $GOV_COUNT"
if [ "$GOV_COUNT" -ge 4 ] && [ "$GOV_COUNT" -le 10 ]; then
  pass "Governance objectives count in range (4-10): $GOV_COUNT"
else
  fail "Governance objectives count out of range (expected 4-10): $GOV_COUNT"
fi

# Check risk appetite statements
RISK_COUNT=$(curl -s "$PAYLOAD_URL/api/risk-appetite-statements?where[sourceDocument.value][equals]=$DOC_ID&limit=0" \
  -H "Authorization: JWT $TOKEN" | jq '.totalDocs // 0')
echo "Risk Appetite Statements: $RISK_COUNT"
if [ "$RISK_COUNT" -ge 4 ] && [ "$RISK_COUNT" -le 6 ]; then
  pass "Risk appetite statements count in range (4-6): $RISK_COUNT"
else
  fail "Risk appetite statements count out of range (expected 4-6): $RISK_COUNT"
fi

# Check audit trail
AUDIT_COUNT=$(curl -s "$PAYLOAD_URL/api/audit-trail-entries?where[sourceTrace.sourceDocumentId][equals]=$DOC_ID&limit=0" \
  -H "Authorization: JWT $TOKEN" | jq '.totalDocs // 0')
echo "Audit Trail Entries: $AUDIT_COUNT"
if [ "$AUDIT_COUNT" -gt 0 ]; then
  pass "Audit trail entries created: $AUDIT_COUNT"
else
  fail "No audit trail entries found"
fi

# Summary
echo ""
echo "=== Regression Test Summary ==="
echo "Passed: $PASS"
echo "Failed: $FAIL"
echo "Document ID: $DOC_ID (clean up manually if needed)"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "REGRESSION DETECTED — review pipeline changes"
  exit 1
fi

echo ""
echo "All checks passed!"
