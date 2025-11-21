#!/bin/bash

# MobileDoor API Testing Script
# Usage: ./test-api.sh

API_BASE="http://localhost:3001"
JWT_TOKEN=""

echo "🚀 MobileDoor API Testing Script"
echo "=============================="
echo "API Base URL: $API_BASE"
echo ""

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=$4

    echo "🔍 Testing: $method $endpoint"
    echo "----------------------------------------"

    if [ -n "$data" ] && [ -n "$headers" ]; then
        http --ignore-stdin $method "$API_BASE$endpoint" $data $headers
    elif [ -n "$data" ]; then
        http --ignore-stdin $method "$API_BASE$endpoint" $data
    elif [ -n "$headers" ]; then
        http --ignore-stdin $method "$API_BASE$endpoint" $headers
    else
        http --ignore-stdin $method "$API_BASE$endpoint"
    fi

    echo ""
    echo "========================================"
    echo ""
}

# Function to extract JWT from response
extract_jwt() {
    local response=$1
    JWT_TOKEN=$(echo "$response" | jq -r '.data.data.token // empty')
    if [ -n "$JWT_TOKEN" ]; then
        echo "🔑 JWT Token extracted: ${JWT_TOKEN:0:50}..."
    else
        echo "❌ No JWT token found in response"
    fi
}

echo "1️⃣  Testing User Registration"
test_endpoint "POST" "/auth/register" \
  'email="test.user@example.com" password="testpass123" name="Test User"'

# Extract JWT from registration (fallback)
echo "2️⃣  Testing User Login"
LOGIN_RESPONSE=$(http --ignore-stdin POST "$API_BASE/auth/login" \
  email="test.user@example.com" password="testpass123")
echo "$LOGIN_RESPONSE"
extract_jwt "$LOGIN_RESPONSE"
echo ""

echo "3️⃣  Testing Public Products List"
test_endpoint "GET" "/products?page=1&limit=5"

if [ -n "$JWT_TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $JWT_TOKEN"

    echo "4️⃣  Testing Protected User Profile"
    test_endpoint "GET" "/users/profile" "" "$AUTH_HEADER"

    echo "5️⃣  Testing Auth Profile"
    test_endpoint "GET" "/auth/me" "" "$AUTH_HEADER"

    echo "6️⃣  Testing Cart (Empty)"
    test_endpoint "GET" "/cart" "" "$AUTH_HEADER"
else
    echo "⚠️  Skipping protected endpoints (No JWT token)"
    echo ""
fi

echo "7️⃣  Testing Error Handling"
test_endpoint "GET" "/products?invalid_param=test"

echo "8️⃣  Testing Invalid Endpoint"
test_endpoint "GET" "/invalid-endpoint"

echo "✅ API Testing Complete!"
echo "📊 Summary:"
echo "   - Registration: ✅ Tested"
echo "   - Login: ✅ Tested"
echo "   - Public Products: ✅ Tested"
echo "   - Protected Endpoints: ${JWT_TOKEN:+✅ Tested} ⚠️ ${JWT_TOKEN:-⚠️ Skipped}"
echo "   - Error Handling: ✅ Tested"