#!/bin/bash

# Script to run the image migration on production database
# Usage: ./run-migration.sh

ADMIN_KEY="oranje-admin-prod-2026"
BACKEND_URL="https://oranjevercel-production.up.railway.app"

echo "🚀 Oranje Image Migration Script"
echo "=================================="
echo ""

# Check if backend is healthy
echo "1. Checking backend health..."
HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo "   ✅ Backend is healthy"
else
  echo "   ❌ Backend is not responding"
  exit 1
fi

echo ""
echo "2. Running image migration..."
echo "   Endpoint: $BACKEND_URL/api/migrate-images"
echo ""

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/migrate-images?key=$ADMIN_KEY")
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "   HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ MIGRATION SUCCESSFUL!"
  echo ""
  echo "Response:"
  echo "$BODY" | python3 -m json.tool 2>&1 || echo "$BODY"
  echo ""
  echo "=================================="
  echo "✅ Images have been deployed to production!"
  echo "   Visit: https://oranjeapp.com.br"
  echo "=================================="
elif [ "$HTTP_CODE" = "404" ]; then
  echo "⏳ Migration endpoint not yet available"
  echo "   Railway is still deploying the new code."
  echo "   Please wait 2-5 minutes and try again."
  echo ""
  echo "   Run this script again: ./run-migration.sh"
elif [ "$HTTP_CODE" = "401" ]; then
  echo "❌ Unauthorized - Invalid ADMIN_KEY"
  echo "$BODY"
elif [ "$HTTP_CODE" = "500" ]; then
  echo "❌ Server Error"
  echo "$BODY" | python3 -m json.tool 2>&1 || echo "$BODY"
else
  echo "❌ Unexpected response"
  echo "$BODY"
fi

echo ""
