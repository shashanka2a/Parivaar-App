#!/bin/bash

# Test script for authentication endpoints
# Usage: ./test-auth.sh

BASE_URL="http://localhost:3000"
TEST_EMAIL="test$(date +%s)@example.com"
TEST_PASSWORD="testpassword123"
TEST_NAME="Test User"

echo "🧪 Testing Authentication Flow"
echo "================================"
echo ""

# Test 1: Signup
echo "1️⃣  Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"$TEST_NAME\"}")

echo "$SIGNUP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SIGNUP_RESPONSE"
echo ""

# Check if signup was successful
if echo "$SIGNUP_RESPONSE" | grep -q "User created successfully"; then
  echo "✅ Signup successful!"
  echo ""
  
  # Test 2: Login
  echo "2️⃣  Testing Login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c cookies.txt)
  
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
  echo ""
  
  if echo "$LOGIN_RESPONSE" | grep -q "Login successful"; then
    echo "✅ Login successful!"
    echo ""
    
    # Test 3: Get current user
    echo "3️⃣  Testing Get Current User..."
    ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/me" \
      -b cookies.txt)
    
    echo "$ME_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ME_RESPONSE"
    echo ""
    
    if echo "$ME_RESPONSE" | grep -q "\"user\""; then
      echo "✅ Get user successful!"
      echo ""
    else
      echo "❌ Get user failed"
    fi
    
    # Test 4: Logout
    echo "4️⃣  Testing Logout..."
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
      -b cookies.txt)
    
    echo "$LOGOUT_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGOUT_RESPONSE"
    echo ""
    
    if echo "$LOGOUT_RESPONSE" | grep -q "Logged out successfully"; then
      echo "✅ Logout successful!"
    else
      echo "❌ Logout failed"
    fi
  else
    echo "❌ Login failed"
  fi
else
  echo "❌ Signup failed"
  echo ""
  echo "Trying login with existing credentials..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    -c cookies.txt)
  echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

# Cleanup
rm -f cookies.txt

echo ""
echo "✨ Test completed!"

