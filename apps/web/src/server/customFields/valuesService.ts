/**
 * Phase 25 — Custom Fields Values Service
 * Task 8 Gap Closure: Full DB-backed implementation using CustomFieldValue model
 */

import { prisma } from "@/lib/prisma";
import { getDefaultDefinitions } from "./registry";
import { normalizeValue, validateValue } from "./engine";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { CustomFieldsValuesChanged } from "@/server/events/types";
import { incrementCounter } from "@/server/observability/metrics";
import { auditEvent } from "@/lib/observability/audit";

/**
 * Get custom field values for an entity
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function getValuesForEntity(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<{ supported: boolean; values: Record<string, any>; reason?: string }> {
  try {
    // Get definitions to know which fields exist
    const defs = getDefaultDefinitions(entityType);

    // Get values from DB
    const dbValues = await prisma.customFieldValue.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
      include: {
        definition: true,
      },
    });

    // Build values map
    const values: Record<string, any> = {};

    for (const dbValue of dbValues) {
      const def = defs.find((d) => d.id === dbValue.definitionId || d.name === dbValue.definition.code);
      if (def) {
        values[def.id] = dbValue.value;
      } else {
        // Use definition code as key
        values[dbValue.definition.code] = dbValue.value;
      }
    }

    return {
      supported: true,
      values,
    };
  } catch (error: any) {
    return {
      supported: false,
      values: {},
      reason: `Failed to get values: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Upsert custom field values for an entity
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function upsertValuesForEntity(
  tenantId: string,
  entityType: string,
  entityId: string,
  values: Record<string, any>
): Promise<{ supported: boolean; values?: Record<string, any>; reason?: string }> {
  // Get definitions to validate and normalize values
  const defs = getDefaultDefinitions(entityType);

  // Also get DB definitions
  const dbDefs = await prisma.customFieldDefinition.findMany({
    where: {
      tenantId,
      entityType,
      active: true,
    },
  });

  // Merge definitions
  const allDefs = [
    ...defs,
    ...dbDefs.map((dbDef) => ({
      id: dbDef.id,
      name: dbDef.code,
      label: dbDef.name,
      type: dbDef.type as any,
      required: dbDef.required,
      options: (dbDef.options as any)?.options || [],
    })),
  ];

  // Validate all values
  const normalizedValues: Record<string, any> = {};
  const errors: string[] = [];

  for (const def of allDefs) {
    const value = values[def.id] ?? values[def.name];
    if (value !== undefined) {
      const validation = validateValue(def, value);
      if (!validation.valid) {
        errors.push(...validation.errors);
        continue;
      }
      normalizedValues[def.id || def.name] = normalizeValue(def, value);
    }
  }

  if (errors.length > 0) {
    return {
      supported: false,
      reason: `Validation errors: ${errors.join("; ")}`,
    };
  }

  try {
    // Upsert each value
    for (const [fieldId, value] of Object.entries(normalizedValues)) {
      // Find definition
      const def = allDefs.find((d) => d.id === fieldId || d.name === fieldId);
      if (!def) continue;

      // Get definition ID (could be from DB or default)
      let definitionId: string;
      const dbDef = dbDefs.find((d) => d.code === def.name || d.id === def.id);
      if (dbDef) {
        definitionId = dbDef.id;
      } else {
        // Default definition - skip (can't store values without DB definition)
        continue;
      }

      // Upsert value
      await prisma.customFieldValue.upsert({
        where: {
          tenantId_definitionId_entityType_entityId: {
            tenantId,
            definitionId,
            entityType,
            entityId,
          },
        },
        update: {
          value: value as any,
        },
        create: {
          tenantId,
          definitionId,
          entityType,
          entityId,
          value: value as any,
        },
      });
    }

    // Publish event
    try {
      const event: CustomFieldsValuesChanged = {
        id: newEventId(),
        tenantId,
        type: "customfields.values.changed",
        occurredAt: nowIso(),
        source: "customFields.valuesService",
        version: 1,
        payload: {
          entityType,
          entityId,
          fieldIds: Object.keys(normalizedValues),
          actorId: "",
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[CustomFields] Failed to publish values.changed event:`, error);
    }

    // Record metrics
    incrementCounter("customfields_values_change_total", {
      entityType,
      result: "success",
      tenantId,
    });

    // Audit log (best-effort)
    try {
      await auditEvent("customFields.values.changed", {
        tenantId,
        entityType,
        entityId,
        fieldIds: Object.keys(normalizedValues),
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      values: normalizedValues,
    };
  } catch (error: any) {
    // Record error metric
    incrementCounter("customfields_values_change_total", {
      entityType,
      result: "error",
      tenantId,
    });

    return {
      supported: false,
      reason: `Failed to upsert values: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Delete custom field values for an entity
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function deleteValuesForEntity(
  tenantId: string,
  entityType: string,
  entityId: string
): Promise<{ supported: boolean; reason?: string }> {
  try {
    await prisma.customFieldValue.deleteMany({
      where: {
        tenantId,
        entityType,
        entityId,
      },
    });

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to delete values: ${error?.message || "unknown"}`,
    };
  }
}
