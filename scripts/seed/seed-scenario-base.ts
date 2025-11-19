#!/usr/bin/env tsx
/**
 * Base Scenario Seed Runner — Shared logic for scenario-based seeding.
 *
 * SAFETY GUARDS:
 * - Requires NEXA_ALLOW_SCENARIO_SEED=true
 * - Refuses to run if DATABASE_URL points to production
 * - Requires NODE_ENV !== "production"
 *
 * Usage:
 *   NEXA_ALLOW_SCENARIO_SEED=true DATABASE_URL=postgresql://... tsx scripts/seed/seed-scenario-base.ts
 */

/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import type { ScenarioKey } from "@/server/seeding/seedHelpers";

const prisma = new PrismaClient();

// Safety guard: require explicit flag
if (process.env.NEXA_ALLOW_SCENARIO_SEED !== "true") {
  console.error("❌ NEXA_ALLOW_SCENARIO_SEED is not set to 'true'");
  console.error("   This script requires explicit permission to run.");
  console.error("   Set: export NEXA_ALLOW_SCENARIO_SEED=true");
  process.exit(1);
}

// Safety guard: check for production markers
const dbUrl = process.env.DATABASE_URL || "";
const prodMarkers = ["production", "prod", "prd", "live", "main", "nexa-erp-prod"];
const isProduction = prodMarkers.some((marker) => dbUrl.toLowerCase().includes(marker));

if (isProduction) {
  console.error("❌ DATABASE_URL appears to point to production!");
  console.error("   This script must NOT run against production.");
  console.error("   Current DATABASE_URL contains production markers.");
  process.exit(1);
}

// Check NODE_ENV as additional guard
if (process.env.NODE_ENV === "production") {
  console.error("❌ NODE_ENV is set to 'production'");
  console.error("   This script must NOT run in production environment.");
  process.exit(1);
}

/**
 * Run scenario seed function.
 * Provides Prisma client and handles cleanup.
 */
export async function runScenarioSeed(
  scenarioKey: ScenarioKey,
  seedFn: (prisma: PrismaClient) => Promise<void>
): Promise<void> {
  console.log(`🌱 Seeding scenario: ${scenarioKey}`);
  console.log("");

  try {
    await seedFn(prisma);
    console.log("");
    console.log(`✅ Scenario seed completed: ${scenarioKey}`);
  } catch (error: any) {
    console.error(`❌ Error seeding scenario ${scenarioKey}:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in scenario-specific scripts
export { prisma };

