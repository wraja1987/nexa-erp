/**
 * Phase 8 — Customers
 * Task 8 Gap Closure: Full DB-backed implementation
 */

import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { auditEvent } from "@/lib/observability/audit";

export interface CustomerInput {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export async function listCustomers(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const customers = await prisma.customer.findMany({
    where: { tenantId: scope.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return customers;
}

export async function getCustomer(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  const customer = await prisma.customer.findFirst({
    where: { id, tenantId: scope.tenantId },
    include: {
      invoices: true,
      quotes: true,
      orders: true,
    },
  });

  if (!customer) {
    throw Object.assign(new Error("Customer not found"), { code: 404 });
  }

  return customer;
}

export async function createCustomer(
  scope: { tenantId: string; entityId?: string | null },
  input: CustomerInput,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  // Check if code already exists
  const existing = await prisma.customer.findUnique({
    where: { code: input.code },
  });

  if (existing) {
    throw Object.assign(new Error("Customer code already exists"), { code: 409 });
  }

  const customer = await prisma.customer.create({
    data: {
      tenantId: scope.tenantId,
      code: input.code,
      name: input.name,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
    },
  });

  // Audit log
  try {
    await auditEvent("sales.customer.created", {
      tenantId: scope.tenantId,
      customerId: customer.id,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return customer;
}

export async function updateCustomer(
  scope: { tenantId: string; entityId?: string | null },
  customerId: string,
  input: Partial<CustomerInput>,
  actorId: string
) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });

  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId: scope.tenantId },
  });

  if (!customer) {
    throw Object.assign(new Error("Customer not found"), { code: 404 });
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...(input.code && { code: input.code }),
      ...(input.name && { name: input.name }),
      ...(input.email !== undefined && { email: input.email || null }),
      ...(input.phone !== undefined && { phone: input.phone || null }),
      ...(input.address !== undefined && { address: input.address || null }),
    },
  });

  // Audit log
  try {
    await auditEvent("sales.customer.updated", {
      tenantId: scope.tenantId,
      customerId,
      actorId,
    });
  } catch (error) {
    // Ignore audit errors
  }

  return updated;
}

