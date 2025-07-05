#!/bin/bash

echo "Testing API Caching (Cookie-based Compliance + Parameter-based Vulnerabilities)..."
echo "=================================================================================="

# Set the namespace cookie for testing
COOKIE="selected-namespace=acc%2Fdefault"

echo "Testing Compliance API Caching (Cookie-based)..."
echo "================================================"

# Test 1: First compliance request (should be cache MISS)
echo "Test 1: First compliance request (cache MISS expected)"
curl -s -H "Accept: application/json" -H "Cookie: $COOKIE" -D /dev/stderr "http://localhost:3000/api/compliance" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test 2: Second compliance request (should be cache HIT)
echo "Test 2: Second compliance request (cache HIT expected)"
curl -s -H "Accept: application/json" -H "Cookie: $COOKIE" -D /dev/stderr "http://localhost:3000/api/compliance" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Testing Vulnerabilities API Caching (Parameter-based)..."
echo "======================================================="

# Test 3: First vulnerabilities request (should be cache MISS)
echo "Test 3: First vulnerabilities request (cache MISS expected)"
curl -s -H "Accept: application/json" -D /dev/stderr "http://localhost:3000/api/vulnerabilities?cluster=prod&namespace=acc%2Fdefault" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test 4: Second vulnerabilities request with same parameters (should be cache HIT)
echo "Test 4: Second vulnerabilities request with same parameters (cache HIT expected)"
curl -s -H "Accept: application/json" -D /dev/stderr "http://localhost:3000/api/vulnerabilities?cluster=prod&namespace=acc%2Fdefault" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test 5: Third vulnerabilities request with different parameters (should be cache MISS)
echo "Test 5: Third vulnerabilities request with different parameters (cache MISS expected)"
curl -s -H "Accept: application/json" -D /dev/stderr "http://localhost:3000/api/vulnerabilities?cluster=staging&namespace=acc%2Fdefault" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Testing Namespaces API Caching..."
echo "================================="

# Test 6: First namespaces request (should be cache MISS)
echo "Test 6: First namespaces request (cache MISS expected)"
curl -s -H "Accept: application/json" -D /dev/stderr "http://localhost:3000/api/namespaces" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Waiting 2 seconds..."
sleep 2

# Test 7: Second namespaces request (should be cache HIT)
echo "Test 7: Second namespaces request (cache HIT expected)"
curl -s -H "Accept: application/json" -D /dev/stderr "http://localhost:3000/api/namespaces" | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "Cache testing completed!"
echo ""
echo "Cache Duration Summary:"
echo "- Compliance: 1 minute (cookie-based namespace selection)"
echo "- Vulnerabilities: 2 minutes (parameter-based caching)"
echo "- Namespaces: 5 minutes"
