#!/usr/bin/env tsx
/**
 * Staging Parity Check Script
 * Compares staging environment variables against production reference.
 * Reports missing variables and mismatches (excluding exempted ones).
 *
 * Usage:
 *   tsx scripts/env/check-staging-parity.ts
 */

/* eslint-disable no-console */
import * as fs from "fs";
import * as path from "path";

// Exempted variables (expected to differ between staging and production)
const EXEMPTED_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "NODE_ENV",
  "STRIPE_SECRET_KEY",
  "TRUELAYER_CLIENT_ID",
  "HMRC_CLIENT_ID",
  "GOOGLE_CLIENT_ID",
  "MICROSOFT_CLIENT_ID",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASSWORD",
];

// Required variables that should exist in both environments
const REQUIRED_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "AUTH_TRUST_HOST",
  "NODE_ENV",
];

// Feature flags that should match
const FEATURE_FLAGS = [
  "AI_ENGINE_ENABLED",
  "AI_AGENT_ENABLED",
  "HEALTHCARE_ENABLED",
  "POS_ENABLED",
];

interface EnvVars {
  [key: string]: string | undefined;
}

function loadEnvFile(filePath: string): EnvVars {
  const vars: EnvVars = {};
  if (!fs.existsSync(filePath)) {
    return vars;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ""); // Remove quotes
        vars[key] = value;
      }
    }
  }

  return vars;
}

function main() {
  console.log("🔍 Staging Parity Check");
  console.log("======================");
  console.log("");

  // Load staging env (from .env.local or .env.staging)
  const stagingEnvPath = path.join(process.cwd(), "apps/web/.env.local");
  const stagingEnv = loadEnvFile(stagingEnvPath);

  // Load production reference (from .env.production.example or docs)
  const prodRefPath = path.join(process.cwd(), "docs/prod-env-expected.md");
  let prodRef: EnvVars = {};

  // Try to parse production reference from markdown if it exists
  if (fs.existsSync(prodRefPath)) {
    const content = fs.readFileSync(prodRefPath, "utf-8");
    // Simple extraction of env var names from markdown (basic implementation)
    const varMatches = content.matchAll(/\b([A-Z_][A-Z0-9_]*)\b/g);
    for (const match of varMatches) {
      const varName = match[1];
      if (varName.length > 3 && !prodRef[varName]) {
        // Mark as present in reference (we don't have actual values)
        prodRef[varName] = "[REFERENCE]";
      }
    }
  }

  // Also check process.env for comparison
  const processEnv: EnvVars = {};
  for (const key in process.env) {
    if (key.startsWith("NEXA_") || key.startsWith("NEXT_") || REQUIRED_VARS.includes(key) || FEATURE_FLAGS.includes(key)) {
      processEnv[key] = process.env[key];
    }
  }

  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  console.log("📋 Checking required variables...");
  for (const varName of REQUIRED_VARS) {
    if (!stagingEnv[varName] && !processEnv[varName]) {
      issues.push(`Missing required variable: ${varName}`);
    } else {
      console.log(`  ✅ ${varName}`);
    }
  }

  // Check feature flags
  console.log("");
  console.log("🚩 Checking feature flags...");
  for (const flag of FEATURE_FLAGS) {
    const stagingValue = stagingEnv[flag] || processEnv[flag];
    const prodValue = prodRef[flag] || processEnv[flag];

    if (!stagingValue) {
      warnings.push(`Feature flag not set in staging: ${flag}`);
    } else if (prodValue && prodValue !== "[REFERENCE]" && stagingValue !== prodValue) {
      warnings.push(`Feature flag mismatch: ${flag} (staging: ${stagingValue}, prod: ${prodValue})`);
    } else {
      console.log(`  ✅ ${flag} = ${stagingValue || "not set"}`);
    }
  }

  // Check for production markers in DATABASE_URL
  console.log("");
  console.log("🔒 Checking safety guards...");
  const dbUrl = stagingEnv.DATABASE_URL || processEnv.DATABASE_URL || "";
  if (dbUrl.includes("production") || dbUrl.includes("prod") || dbUrl.includes("prd")) {
    issues.push("DATABASE_URL appears to point to production!");
  } else {
    console.log("  ✅ DATABASE_URL appears safe (non-production)");
  }

  // Summary
  console.log("");
  console.log("📊 Summary");
  console.log("==========");

  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ No issues found. Staging parity looks good!");
    console.log("");
    console.log("Note: This is a basic check. Review exempted variables manually:");
    console.log("  - DATABASE_URL (should differ)")
    console.log("  - NEXTAUTH_URL (should differ)")
    console.log("  - Third-party API keys (can differ)")
    process.exit(0);
  } else {
    if (issues.length > 0) {
      console.log("❌ Issues found:");
      for (const issue of issues) {
        console.log(`  - ${issue}`);
      }
    }

    if (warnings.length > 0) {
      console.log("");
      console.log("⚠️  Warnings:");
      for (const warning of warnings) {
        console.log(`  - ${warning}`);
      }
    }

    console.log("");
    console.log("💡 Recommendations:");
    console.log("  1. Review missing variables and set them in staging");
    console.log("  2. Ensure feature flags match production (except exempted ones)");
    console.log("  3. Verify DATABASE_URL points to staging branch, not production");
    console.log("");
    console.log("See ops/staging-parity-phase15.md for detailed guidance.");

    // Exit with code 0 (non-blocking) but print warnings
    process.exit(0);
  }
}

main();

