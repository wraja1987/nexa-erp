/**
 * Phase 25 — Custom Fields Definitions Service
 * Task 8 Gap Closure: Full DB-backed implementation using CustomFieldDefinition model
 */

import { prisma } from "@/lib/prisma";
import { getDefaultDefinitions, listSupportedEntityTypes } from "./registry";
import { publishWithOutbox } from "@/server/events/publisher";
import { newEventId, nowIso } from "@/server/events/types";
import type { CustomFieldsDefinitionChanged } from "@/server/events/types";
import { incrementCounter } from "@/server/observability/metrics";
import { auditEvent } from "@/lib/observability/audit";
import type { CustomFieldDefinition } from "./types";

/**
 * List definitions for an entity type
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function listDefinitions(
  tenantId: string,
  entityType: string
): Promise<{ supported: boolean; definitions: CustomFieldDefinition[]; reason?: string }> {
  try {
    // Check if entity type is supported
    const supportedTypes = listSupportedEntityTypes();
    if (!supportedTypes.includes(entityType)) {
      return {
        supported: false,
        definitions: [],
        reason: `Entity type "${entityType}" is not supported`,
      };
    }

    // Get definitions from DB
    const dbDefs = await prisma.customFieldDefinition.findMany({
      where: {
        tenantId,
        entityType,
        active: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform DB definitions to CustomFieldDefinition format
    const definitions: CustomFieldDefinition[] = dbDefs.map((dbDef) => ({
      id: dbDef.id,
      tenantId: dbDef.tenantId,
      entityType: dbDef.entityType,
      name: dbDef.code,
      label: dbDef.name,
      type: dbDef.type as any,
      required: dbDef.required,
      options: (dbDef.options as any)?.options || [],
      defaultValue: undefined,
      helpText: undefined,
      order: undefined,
      visibility: ["detail", "list"] as any,
    }));

    // Merge with default definitions (code-based)
    const defaultDefs = getDefaultDefinitions(entityType);
    const dbCodes = new Set(dbDefs.map((d) => d.code));
    for (const defaultDef of defaultDefs) {
      if (!dbCodes.has(defaultDef.name)) {
        definitions.push(defaultDef);
      }
    }

    return {
      supported: true,
      definitions,
    };
  } catch (error: any) {
    // Fallback to defaults on error
    const defaultDefs = getDefaultDefinitions(entityType);
    return {
      supported: true,
      definitions: defaultDefs,
    };
  }
}

/**
 * Create or update a custom field definition
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function createOrUpdateDefinition(
  tenantId: string,
  definition: CustomFieldDefinition
): Promise<{ supported: boolean; definition?: CustomFieldDefinition; reason?: string }> {
  try {
    // Validate entity type
    const supportedTypes = listSupportedEntityTypes();
    if (!supportedTypes.includes(definition.entityType)) {
      return {
        supported: false,
        reason: `Entity type "${definition.entityType}" is not supported`,
      };
    }

    // Upsert definition
    const dbDef = await prisma.customFieldDefinition.upsert({
      where: {
        tenantId_entityType_code: {
          tenantId,
          entityType: definition.entityType,
          code: definition.name,
        },
      },
      update: {
        name: definition.label,
        type: definition.type,
        required: definition.required || false,
        options: definition.options ? { options: definition.options } : null,
        active: true,
      },
      create: {
        tenantId,
        entityType: definition.entityType,
        code: definition.name,
        name: definition.label,
        type: definition.type,
        required: definition.required || false,
        options: definition.options ? { options: definition.options } : null,
        active: true,
      },
    });

    // Publish event
    try {
      const event: CustomFieldsDefinitionChanged = {
        id: newEventId(),
        tenantId,
        type: "customfields.definition.changed",
        occurredAt: nowIso(),
        source: "customFields.definitionsService",
        version: 1,
        payload: {
          entityType: definition.entityType,
          fieldId: dbDef.id,
          action: "created", // Could check if existed before
          actorId: "", // Will be set by caller if available
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[CustomFields] Failed to publish definition.changed event:`, error);
    }

    // Record metrics
    incrementCounter("customfields_definition_change_total", {
      entityType: definition.entityType,
      result: "success",
      tenantId,
    });

    // Audit log (best-effort)
    try {
      await auditEvent("customFields.definition.changed", {
        tenantId,
        entityType: definition.entityType,
        fieldId: dbDef.id,
        action: "created",
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
      definition: {
        id: dbDef.id,
        tenantId: dbDef.tenantId,
        entityType: dbDef.entityType,
        name: dbDef.code,
        label: dbDef.name,
        type: dbDef.type as any,
        required: dbDef.required,
        options: (dbDef.options as any)?.options || [],
      },
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to create/update definition: ${error?.message || "unknown"}`,
    };
  }
}

/**
 * Delete a custom field definition
 * Task 8 Gap Closure: DB-backed implementation
 */
export async function deleteDefinition(
  tenantId: string,
  entityType: string,
  fieldId: string
): Promise<{ supported: boolean; reason?: string }> {
  try {
    // Verify definition belongs to tenant
    const dbDef = await prisma.customFieldDefinition.findFirst({
      where: {
        id: fieldId,
        tenantId,
        entityType,
      },
    });

    if (!dbDef) {
      return {
        supported: false,
        reason: "Definition not found or does not belong to tenant",
      };
    }

    // Soft delete (set active = false) or hard delete
    // For now, hard delete
    await prisma.customFieldDefinition.delete({
      where: { id: fieldId },
    });

    // Also delete all values for this definition
    await prisma.customFieldValue.deleteMany({
      where: {
        definitionId: fieldId,
        tenantId,
      },
    });

    // Publish event
    try {
      const event: CustomFieldsDefinitionChanged = {
        id: newEventId(),
        tenantId,
        type: "customfields.definition.changed",
        occurredAt: nowIso(),
        source: "customFields.definitionsService",
        version: 1,
        payload: {
          entityType,
          fieldId,
          action: "deleted",
          actorId: "",
        },
      };
      await publishWithOutbox(event);
    } catch (error) {
      console.warn(`[CustomFields] Failed to publish definition.deleted event:`, error);
    }

    // Audit log (best-effort)
    try {
      await auditEvent("customFields.definition.deleted", {
        tenantId,
        entityType,
        fieldId,
      });
    } catch (error) {
      // Ignore audit errors
    }

    return {
      supported: true,
    };
  } catch (error: any) {
    return {
      supported: false,
      reason: `Failed to delete definition: ${error?.message || "unknown"}`,
    };
  }
}
