/**
 * Phase 24 — Workflow Registry
 * Task 8 Gap Closure: Full DB-backed implementation using WorkflowDefinition model
 */

import { prisma } from "@/lib/prisma";
import type { WorkflowDefinition } from "./types";

/**
 * Default workflow definitions (used as seeds if no DB definition exists)
 */
const DEFAULT_DEFINITIONS: Record<string, Omit<WorkflowDefinition, "tenantId">> = {
  "finance.invoice": {
    entityType: "finance.invoice",
    states: [
      { id: "draft", label: "Draft", description: "Invoice is being prepared" },
      { id: "approved", label: "Approved", description: "Invoice has been approved" },
      { id: "sent", label: "Sent", description: "Invoice has been sent to customer" },
      { id: "part_paid", label: "Partially Paid", description: "Invoice has been partially paid" },
      { id: "paid", label: "Paid", description: "Invoice is fully paid", isTerminal: true },
      { id: "void", label: "Void", description: "Invoice has been voided", isTerminal: true },
    ],
    transitions: [
      {
        id: "approve",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve Invoice",
        conditions: [
          { type: "role", role: "STAFF" },
          { type: "amount", operator: "<", value: 1000 },
        ],
      },
      {
        id: "approve_medium",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve Invoice (Medium)",
        conditions: [
          { type: "role", role: "MANAGER" },
          { type: "amount", operator: ">=", value: 1000 },
          { type: "amount", operator: "<", value: 10000 },
        ],
      },
      {
        id: "approve_high",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve Invoice (High)",
        conditions: [
          { type: "role", role: "ADMIN" },
          { type: "amount", operator: ">=", value: 10000 },
        ],
      },
      {
        id: "send",
        fromState: "approved",
        toState: "sent",
        action: "send",
        label: "Send Invoice",
        conditions: [{ type: "role", role: "STAFF" }],
      },
      {
        id: "void",
        fromState: "draft",
        toState: "void",
        action: "void",
        label: "Void Invoice",
        conditions: [{ type: "role", role: "MANAGER" }],
      },
    ],
    initialState: "draft",
  },
  "purchasing.po": {
    entityType: "purchasing.po",
    states: [
      { id: "draft", label: "Draft", description: "PO is being prepared" },
      { id: "approved", label: "Approved", description: "PO has been approved" },
      { id: "sent", label: "Sent", description: "PO has been sent to supplier" },
      { id: "received", label: "Received", description: "PO has been received" },
      { id: "closed", label: "Closed", description: "PO is closed", isTerminal: true },
      { id: "cancelled", label: "Cancelled", description: "PO has been cancelled", isTerminal: true },
    ],
    transitions: [
      {
        id: "approve",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve PO",
        conditions: [
          { type: "role", role: "STAFF" },
          { type: "amount", operator: "<", value: 1000 },
        ],
      },
      {
        id: "approve_medium",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve PO (Medium)",
        conditions: [
          { type: "role", role: "MANAGER" },
          { type: "amount", operator: ">=", value: 1000 },
          { type: "amount", operator: "<", value: 10000 },
        ],
      },
      {
        id: "approve_high",
        fromState: "draft",
        toState: "approved",
        action: "approve",
        label: "Approve PO (High)",
        conditions: [
          { type: "role", role: "ADMIN" },
          { type: "amount", operator: ">=", value: 10000 },
        ],
      },
      {
        id: "cancel",
        fromState: "draft",
        toState: "cancelled",
        action: "cancel",
        label: "Cancel PO",
        conditions: [{ type: "role", role: "MANAGER" }],
      },
      {
        id: "cancel_approved",
        fromState: "approved",
        toState: "cancelled",
        action: "cancel",
        label: "Cancel Approved PO",
        conditions: [{ type: "role", role: "ADMIN" }],
      },
    ],
    initialState: "draft",
  },
  "manufacturing.workorder": {
    entityType: "manufacturing.workorder",
    states: [
      { id: "planned", label: "Planned", description: "Work order is planned" },
      { id: "released", label: "Released", description: "Work order has been released to production" },
      { id: "completed", label: "Completed", description: "Work order is completed", isTerminal: true },
      { id: "cancelled", label: "Cancelled", description: "Work order has been cancelled", isTerminal: true },
    ],
    transitions: [
      {
        id: "start",
        fromState: "planned",
        toState: "released",
        action: "start",
        label: "Start Work Order",
        conditions: [{ type: "role", role: "MANAGER" }],
      },
      {
        id: "complete",
        fromState: "released",
        toState: "completed",
        action: "complete",
        label: "Complete Work Order",
        conditions: [{ type: "role", role: "STAFF" }],
      },
      {
        id: "cancel",
        fromState: "planned",
        toState: "cancelled",
        action: "cancel",
        label: "Cancel Work Order",
        conditions: [{ type: "role", role: "MANAGER" }],
      },
      {
        id: "cancel_released",
        fromState: "released",
        toState: "cancelled",
        action: "cancel",
        label: "Cancel Released Work Order",
        conditions: [{ type: "role", role: "ADMIN" }],
      },
    ],
    initialState: "planned",
  },
};

/**
 * Get workflow definition for an entity type
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function getWorkflowDefinition(
  entityType: string,
  tenantId: string
): Promise<{ supported: boolean; def?: WorkflowDefinition; reason?: string }> {
  try {
    // Try to load from DB
    const dbDef = await prisma.workflowDefinition.findFirst({
      where: {
        tenantId,
        entityType,
        active: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (dbDef) {
      // Parse steps JSON
      const steps = dbDef.steps as any;
      return {
        supported: true,
        def: {
          entityType: dbDef.entityType,
          tenantId: dbDef.tenantId,
          states: steps.states || [],
          transitions: steps.transitions || [],
          initialState: steps.initialState || "draft",
        },
      };
    }

    // Fallback to default definition
    const defaultDef = DEFAULT_DEFINITIONS[entityType];
    if (defaultDef) {
      return {
        supported: true,
        def: {
          ...defaultDef,
          tenantId,
        },
      };
    }

    return {
      supported: false,
      reason: `No workflow definition found for entity type "${entityType}"`,
    };
  } catch (error: any) {
    // Fallback to default on error
    const defaultDef = DEFAULT_DEFINITIONS[entityType];
    if (defaultDef) {
      return {
        supported: true,
        def: {
          ...defaultDef,
          tenantId,
        },
      };
    }

    return {
      supported: false,
      reason: `Failed to get workflow definition: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * List all workflow definitions for a tenant
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function listWorkflowDefinitions(tenantId: string): Promise<WorkflowDefinition[]> {
  try {
    const dbDefs = await prisma.workflowDefinition.findMany({
      where: {
        tenantId,
        active: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    const definitions: WorkflowDefinition[] = [];

    for (const dbDef of dbDefs) {
      const steps = dbDef.steps as any;
      definitions.push({
        entityType: dbDef.entityType,
        tenantId: dbDef.tenantId,
        states: steps.states || [],
        transitions: steps.transitions || [],
        initialState: steps.initialState || "draft",
      });
    }

    // Also include defaults that aren't in DB
    const dbEntityTypes = new Set(dbDefs.map((d) => d.entityType));
    for (const [entityType, defaultDef] of Object.entries(DEFAULT_DEFINITIONS)) {
      if (!dbEntityTypes.has(entityType)) {
        definitions.push({
          ...defaultDef,
          tenantId,
        });
      }
    }

    return definitions;
  } catch (error) {
    console.warn(`[Workflow] Failed to list workflow definitions:`, error);
    // Return defaults on error
    return Object.values(DEFAULT_DEFINITIONS).map((def) => ({
      ...def,
      tenantId,
    }));
  }
}

/**
 * Upsert workflow definition
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function upsertWorkflowDefinition(
  tenantId: string,
  entityType: string,
  definition: Omit<WorkflowDefinition, "tenantId" | "entityType">
): Promise<{ supported: boolean; definition?: WorkflowDefinition; reason?: string }> {
  try {
    // Generate a code from entityType (or use entityType as code)
    const code = entityType.replace(/\./g, "_");

    const steps = {
      states: definition.states,
      transitions: definition.transitions,
      initialState: definition.initialState,
    };

    const dbDef = await prisma.workflowDefinition.upsert({
      where: { code },
      update: {
        name: `${entityType} Workflow`,
        entityType,
        steps: steps as any,
        active: true,
      },
      create: {
        tenantId,
        code,
        name: `${entityType} Workflow`,
        entityType,
        steps: steps as any,
        active: true,
      },
    });

    return {
      supported: true,
      definition: {
        entityType: dbDef.entityType,
        tenantId: dbDef.tenantId,
        states: definition.states,
        transitions: definition.transitions,
        initialState: definition.initialState,
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to upsert workflow definition: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * List all supported entity types
 */
export function listSupportedEntityTypes(): string[] {
  return Object.keys(DEFAULT_DEFINITIONS);
}
