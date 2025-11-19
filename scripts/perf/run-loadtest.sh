#!/usr/bin/env bash
set -euo pipefail

# Load test runner script
# Ensures non-production target and runs Artillery load test

echo "🚀 Nexa ERP Load Test Runner"
echo "=============================="
echo ""

# Check if PERF_BASE_URL is set
if [ -z "${PERF_BASE_URL:-}" ]; then
  echo "❌ PERF_BASE_URL environment variable is not set."
  echo ""
  echo "Usage:"
  echo "  export PERF_BASE_URL=https://staging.nexaai.co.uk"
  echo "  bash scripts/perf/run-loadtest.sh"
  echo ""
  exit 1
fi

# Safety check: refuse to run against production
if [[ "${PERF_BASE_URL}" == *"production"* ]] || \
   [[ "${PERF_BASE_URL}" == *"prod"* ]] || \
   [[ "${PERF_BASE_URL}" == *"app.nexaai.co.uk"* ]] || \
   [[ "${PERF_BASE_URL}" == *"nexaai.co.uk"* && "${PERF_BASE_URL}" != *"staging"* ]]; then
  echo "❌ WARNING: PERF_BASE_URL appears to point to production!"
  echo "   Current URL: ${PERF_BASE_URL}"
  echo "   This script must NOT run against production."
  echo "   Use staging or local environment instead."
  exit 1
fi

echo "✅ Target URL: ${PERF_BASE_URL}"
echo ""

# Check if Artillery is installed
if ! command -v artillery >/dev/null 2>&1; then
  echo "⚠️  Artillery not found. Installing..."
  npm install -g artillery@latest || {
    echo "❌ Failed to install Artillery. Please install manually:"
    echo "   npm install -g artillery"
    exit 1
  }
fi

# Create reports directory
mkdir -p reports/perf

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="reports/perf/loadtest-${TIMESTAMP}.json"
SUMMARY_FILE="reports/perf/loadtest-${TIMESTAMP}.md"

echo "📊 Running load test..."
echo "   Config: ops/perf/loadtest-200rps.yml"
echo "   Target: ${PERF_BASE_URL}"
echo "   Report: ${REPORT_FILE}"
echo ""

# Run Artillery
if artillery run ops/perf/loadtest-200rps.yml --output "${REPORT_FILE}"; then
  echo ""
  echo "✅ Load test completed successfully!"
  echo ""
  
  # Generate summary
  echo "📋 Generating summary..."
  artillery report "${REPORT_FILE}" > "${SUMMARY_FILE}" 2>&1 || true
  
  echo "📄 Summary saved to: ${SUMMARY_FILE}"
  echo "📊 Full report saved to: ${REPORT_FILE}"
  echo ""
  echo "Key metrics:"
  artillery report "${REPORT_FILE}" 2>&1 | grep -E "(requests|latency|errors)" | head -20 || true
else
  echo ""
  echo "❌ Load test failed. Check the output above for details."
  exit 1
fi

