#!/usr/bin/env bash
# Seed demo data: creates an Annual Report with pre-parsed text from HSBC pages 1-20.
# Usage: PAYLOAD_URL=https://your-railway-url ./seed-demo.sh
# Requires: jq, curl

set -euo pipefail

PAYLOAD_URL="${PAYLOAD_URL:-http://localhost:3000}"
DEMO_TEXT_FILE="$(dirname "$0")/hsbc-annual-report-2025-pages-1-20.txt"

if [ ! -f "$DEMO_TEXT_FILE" ]; then
  echo "ERROR: Demo text file not found: $DEMO_TEXT_FILE"
  exit 1
fi

echo "=== Evonix GRC Demo Data Seeder ==="
echo "Target: $PAYLOAD_URL"

# Step 1: Login to get auth token
echo ""
echo "Step 1: Authenticating..."
read -rp "Admin email: " EMAIL
read -rsp "Admin password: " PASSWORD
echo ""

AUTH_RESPONSE=$(curl -s -X POST "$PAYLOAD_URL/api/users/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"password\": \"$PASSWORD\"}")

TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.token // empty')
if [ -z "$TOKEN" ]; then
  echo "ERROR: Authentication failed"
  echo "$AUTH_RESPONSE" | jq .
  exit 1
fi
echo "Authenticated successfully."

# Step 2: Check if demo document already exists
echo ""
echo "Step 2: Checking for existing demo data..."
EXISTING=$(curl -s "$PAYLOAD_URL/api/annual-reports?where[title][equals]=HSBC%20Annual%20Report%20and%20Accounts%202025" \
  -H "Authorization: JWT $TOKEN")

EXISTING_COUNT=$(echo "$EXISTING" | jq '.totalDocs // 0')
if [ "$EXISTING_COUNT" -gt 0 ]; then
  EXISTING_ID=$(echo "$EXISTING" | jq -r '.docs[0].id')
  echo "Demo document already exists (ID: $EXISTING_ID). Updating parsedText..."

  PARSED_TEXT=$(jq -Rs '.' < "$DEMO_TEXT_FILE")

  curl -s -o /dev/null -w "HTTP %{http_code}" -X PATCH "$PAYLOAD_URL/api/annual-reports/$EXISTING_ID" \
    -H "Authorization: JWT $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"parsedText\": $PARSED_TEXT, \"extractionStatus\": \"parsed\"}"

  echo ""
  echo "Updated existing document."
  DOC_ID="$EXISTING_ID"
else
  echo "Creating new Annual Report..."

  PARSED_TEXT=$(jq -Rs '.' < "$DEMO_TEXT_FILE")

  CREATE_RESPONSE=$(curl -s -X POST "$PAYLOAD_URL/api/annual-reports" \
    -H "Authorization: JWT $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"HSBC Annual Report and Accounts 2025\",
      \"organization\": \"HSBC Holdings plc\",
      \"reportingYear\": 2025,
      \"publishDate\": \"2026-02-25\",
      \"parsedText\": $PARSED_TEXT,
      \"extractionStatus\": \"parsed\"
    }")

  DOC_ID=$(echo "$CREATE_RESPONSE" | jq -r '.doc.id // empty')
  if [ -z "$DOC_ID" ]; then
    echo "ERROR: Failed to create document"
    echo "$CREATE_RESPONSE" | jq .
    exit 1
  fi
  echo "Created Annual Report (ID: $DOC_ID)"
fi

TEXT_LENGTH=$(wc -c < "$DEMO_TEXT_FILE" | tr -d ' ')

echo ""
echo "=== Demo Data Ready ==="
echo "Document ID: $DOC_ID"
echo "Parsed text: ${TEXT_LENGTH} characters (pages 1-20)"
echo ""
echo "To run the GRC pipeline on this document:"
echo "  POST $PAYLOAD_URL/api/pipeline-runs"
echo "  Body: { \"documentType\": \"annual-reports\", \"documentId\": $DOC_ID }"
