/**
 * Phase 8 — CRM Opportunities/Pipelines
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";
import { publishWithOutbox } from "@/server/events/publisher";
import type { CrmOpportunityCreated, CrmOpportunityUpdated, CrmOpportunityClosed, CrmLeadConverted } from "@/server/events/types";
import { newEventId, nowIso } from "@/server/events/types";

export interface CrmOpportunityInput {
  accountId?: string;
  name: string;
  stage: string; // lead, qualified, proposal, negotiation, won, lost
  value?: number;
  probability?: number;
  closeDate?: Date;
}

export async function listPipelines(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  // Return stages with opportunity counts
  const opportunities = await prisma.crmOpportunity.findMany({
    where: { tenantId: scope.tenantId },
    select: { stage: true },
  });

  const stages = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];
  const pipeline = stages.map((stage) => ({
    stage,
    count: opportunities.filter((o) => o.stage === stage).length,
  }));

  return pipeline;
}

export async function listOpportunities(
  scope: { tenantId: string; entityId?: string | null },
  accountId?: string,
  stage?: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const where: any = { tenantId: scope.tenantId };
  if (accountId) {
    where.accountId = accountId;
  }
  if (stage) {
    where.stage = stage;
  }

  const opportunities = await prisma.crmOpportunity.findMany({
    where,
    include: {
      account: {
        select: { id: true, name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return opportunities;
}

export async function createOpportunity(
  scope: { tenantId: string; entityId?: string | null },
  input: CrmOpportunityInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Verify account exists if provided
  if (input.accountId) {
    const account = await prisma.crmAccount.findFirst({
      where: { id: input.accountId, tenantId: scope.tenantId },
    });
    if (!account) {
      throw Object.assign(new Error("Account not found"), { code: 404 });
    }
  }

  const opportunity = await prisma.crmOpportunity.create({
    data: {
      tenantId: scope.tenantId,
      accountId: input.accountId || null,
      name: input.name,
      stage: input.stage,
      value: input.value || null,
      probability: input.probability || 0,
      closeDate: input.closeDate || null,
    },
    include: {
      account: {
        select: { id: true, name: true },
      },
    },
  });

  // Audit log
  try {
    await auditEvent("crm.opportunity.created", {
      tenantId: scope.tenantId,
      opportunityId: opportunity.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event
  try {
    await publishWithOutbox<CrmOpportunityCreated>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "crm.opportunity.created",
      occurredAt: nowIso(),
      source: "crm.pipelines",
      version: 1,
      payload: {
        opportunityId: opportunity.id,
        accountId: opportunity.accountId || undefined,
        contactId: opportunity.contactId || undefined,
        stage: opportunity.stage,
        value: opportunity.value ? Number(opportunity.value) : undefined,
        currency: opportunity.currency,
        createdAt: opportunity.createdAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    // Log but don't fail - event emission is best-effort
    console.error("[CRM] Failed to emit opportunity.created event:", error);
  }

  return opportunity;
}

export async function updateOpportunity(
  scope: { tenantId: string; entityId?: string | null },
  opportunityId: string,
  input: Partial<CrmOpportunityInput>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const opportunity = await prisma.crmOpportunity.findFirst({
    where: { id: opportunityId, tenantId: scope.tenantId },
  });

  if (!opportunity) {
    throw Object.assign(new Error("Opportunity not found"), { code: 404 });
  }

  const updated = await prisma.crmOpportunity.update({
    where: { id: opportunityId },
    data: {
      ...(input.accountId !== undefined && { accountId: input.accountId || null }),
      ...(input.name && { name: input.name }),
      ...(input.stage && { stage: input.stage }),
      ...(input.value !== undefined && { value: input.value || null }),
      ...(input.probability !== undefined && { probability: input.probability || 0 }),
      ...(input.closeDate !== undefined && { closeDate: input.closeDate || null }),
    },
  });

  // Audit log
  try {
    await auditEvent("crm.opportunity.updated", {
      tenantId: scope.tenantId,
      opportunityId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event
  try {
    await publishWithOutbox<CrmOpportunityUpdated>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "crm.opportunity.updated",
      occurredAt: nowIso(),
      source: "crm.pipelines",
      version: 1,
      payload: {
        opportunityId,
        stage: input.stage || undefined,
        value: input.value !== undefined ? input.value : undefined,
        status: input.stage === "won" || input.stage === "lost" ? input.stage : undefined,
        updatedAt: updated.updatedAt.toISOString(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[CRM] Failed to emit opportunity.updated event:", error);
  }

  return updated;
}

export async function moveOpportunityStage(
  scope: { tenantId: string; entityId?: string | null },
  opportunityId: string,
  newStage: string,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const opportunity = await prisma.crmOpportunity.findFirst({
    where: { id: opportunityId, tenantId: scope.tenantId },
  });

  if (!opportunity) {
    throw Object.assign(new Error("Opportunity not found"), { code: 404 });
  }

  const updated = await prisma.crmOpportunity.update({
    where: { id: opportunityId },
    data: { stage: newStage },
  });

  // Record stage history
  try {
    await prisma.opportunityStageHistory.create({
      data: {
        opportunityId,
        fromStage: opportunity.stage,
        toStage: newStage,
        probability: updated.probability || 0,
        changedBy: actorId,
      },
    });
  } catch (error) {
    // Log but continue
    console.error("[CRM] Failed to record stage history:", error);
  }

  // Audit log
  try {
    await auditEvent("crm.opportunity.stage.moved", {
      tenantId: scope.tenantId,
      opportunityId,
      oldStage: opportunity.stage,
      newStage,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  // Emit domain event
  try {
    const isClosed = newStage === "won" || newStage === "lost";
    if (isClosed) {
      await publishWithOutbox<CrmOpportunityClosed>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "crm.opportunity.closed",
        occurredAt: nowIso(),
        source: "crm.pipelines",
        version: 1,
        payload: {
          opportunityId,
          status: newStage as "won" | "lost",
          actualCloseDate: updated.actualCloseDate?.toISOString() || nowIso(),
          finalValue: updated.value ? Number(updated.value) : undefined,
          actorId,
        },
      });
    } else {
      await publishWithOutbox<CrmOpportunityUpdated>({
        id: newEventId(),
        tenantId: scope.tenantId,
        type: "crm.opportunity.updated",
        occurredAt: nowIso(),
        source: "crm.pipelines",
        version: 1,
        payload: {
          opportunityId,
          stage: newStage,
          updatedAt: updated.updatedAt.toISOString(),
          actorId,
        },
      });
    }
  } catch (error) {
    console.error("[CRM] Failed to emit opportunity event:", error);
  }

  return updated;
}

/**
 * Convert a Contact to an Opportunity (Lead → Opportunity conversion)
 * Phase 4A - Depth Pass: Full CRM pipeline implementation
 */
export async function convertContactToOpportunity(
  scope: { tenantId: string; entityId?: string | null },
  contactId: string,
  input: {
    name: string;
    value?: number;
    expectedCloseDate?: Date;
    source?: string;
  },
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Get contact
  const contact = await prisma.crmContact.findFirst({
    where: { id: contactId, tenantId: scope.tenantId },
  });

  if (!contact) {
    throw Object.assign(new Error("Contact not found"), { code: 404 });
  }

  // Create opportunity from contact
  const opportunity = await createOpportunity(
    scope,
    {
      accountId: contact.accountId || undefined,
      name: input.name,
      stage: "qualification",
      value: input.value,
      closeDate: input.expectedCloseDate,
    },
    actorId
  );

  // Link contact to opportunity
  await prisma.crmOpportunity.update({
    where: { id: opportunity.id },
    data: { contactId: contact.id, source: input.source || null },
  });

  // Emit lead converted event (treating contact as lead)
  try {
    await publishWithOutbox<CrmLeadConverted>({
      id: newEventId(),
      tenantId: scope.tenantId,
      type: "crm.lead.converted",
      occurredAt: nowIso(),
      source: "crm.pipelines",
      version: 1,
      payload: {
        leadId: contactId, // Using contactId as leadId
        opportunityId: opportunity.id,
        accountId: contact.accountId || undefined,
        contactId: contact.id,
        convertedAt: nowIso(),
        actorId,
      },
    });
  } catch (error) {
    console.error("[CRM] Failed to emit lead.converted event:", error);
  }

  return opportunity;
}
