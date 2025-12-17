#!/bin/bash

echo "🧪 Testing Parivaar App Flow"
echo "============================"
echo ""

BASE_URL="${1:-http://localhost:3000}"

echo "📍 Testing Base URL: $BASE_URL"
echo ""

# Test 1: Public Route (Onboarding)
echo "1️⃣  Testing Public Route: /onboarding"
ONBOARDING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/onboarding")
if [ "$ONBOARDING_STATUS" = "200" ]; then
  echo "   ✅ Onboarding page loads (Status: $ONBOARDING_STATUS)"
else
  echo "   ❌ Onboarding page failed (Status: $ONBOARDING_STATUS)"
fi
echo ""

# Test 2: Protected Route Without Auth (should redirect)
echo "2️⃣  Testing Protected Route Without Auth: /dashboard"
DASHBOARD_REDIRECT=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard")
if [ "$DASHBOARD_REDIRECT" = "307" ] || [ "$DASHBOARD_REDIRECT" = "302" ]; then
  echo "   ✅ Dashboard redirects when not authenticated (Status: $DASHBOARD_REDIRECT)"
else
  echo "   ⚠️  Dashboard status: $DASHBOARD_REDIRECT (Expected 302/307 redirect)"
fi
echo ""

# Test 3: API Connection Test
echo "3️⃣  Testing API Connection: /api/test-connection"
CONNECTION_RESPONSE=$(curl -s "$BASE_URL/api/test-connection" | head -c 200)
if echo "$CONNECTION_RESPONSE" | grep -q "supabase\|prisma\|timestamp"; then
  echo "   ✅ Connection test endpoint responds"
  echo "   Response preview: ${CONNECTION_RESPONSE:0:100}..."
else
  echo "   ⚠️  Connection test may have issues"
fi
echo ""

# Test 4: Auth Flow Test
echo "4️⃣  Testing Auth Flow: /api/test-auth-flow"
AUTH_FLOW_RESPONSE=$(curl -s "$BASE_URL/api/test-auth-flow" | head -c 200)
if echo "$AUTH_FLOW_RESPONSE" | grep -q "tests\|timestamp"; then
  echo "   ✅ Auth flow test endpoint responds"
  echo "   Response preview: ${AUTH_FLOW_RESPONSE:0:100}..."
else
  echo "   ⚠️  Auth flow test may have issues"
fi
echo ""

# Test 5: Root Route
echo "5️⃣  Testing Root Route: /"
ROOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/")
if [ "$ROOT_STATUS" = "200" ]; then
  echo "   ✅ Root route loads (Status: $ROOT_STATUS)"
else
  echo "   ⚠️  Root route status: $ROOT_STATUS"
fi
echo ""

echo "✨ Flow test completed!"
echo ""
echo "📝 Next Steps:"
echo "   1. Test signup: POST $BASE_URL/api/auth/signup"
echo "   2. Test login: POST $BASE_URL/api/auth/login"
echo "   3. Test protected route with auth cookies"
