import { prisma } from "@/lib/prisma";
import { assertLegalEntityAccess } from "@/lib/finance/entity";
import { maybeEncryptEmail, maybeDecryptEmail, maybeEncryptPhone, maybeDecryptPhone } from "@/server/security/byokHooks";

export type EmployeeInput = {
  empNo: string;
  firstName: string;
  lastName: string;
  email?: string;
};

export async function listEmployees(scope: { tenantId: string; entityId?: string | null }) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  return prisma.employee.findMany({ where: { tenantId: scope.tenantId }, orderBy: { createdAt: "desc" } });
}

export async function getEmployee(scope: { tenantId: string; entityId?: string | null }, id: string) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const emp = await prisma.employee.findFirst({ where: { id, tenantId: scope.tenantId } });
  if (!emp) throw Object.assign(new Error("not_found"), { code: 404 });
  
  // Decrypt sensitive fields (NOOP when unsupported)
  const decryptedEmail = emp.email ? await maybeDecryptEmail(scope.tenantId, emp.email) : null;
  
  return {
    ...emp,
    email: decryptedEmail,
  };
}

export async function createEmployee(scope: { tenantId: string; entityId?: string | null }, input: EmployeeInput) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  
  // Encrypt sensitive fields (NOOP when unsupported)
  const encryptedEmail = input.email ? await maybeEncryptEmail(scope.tenantId, input.email) : null;
  
  return prisma.employee.create({
    data: {
      tenantId: scope.tenantId,
      empNo: input.empNo,
      firstName: input.firstName,
      lastName: input.lastName,
      email: encryptedEmail,
    },
  });
}

export async function updateEmployee(scope: { tenantId: string; entityId?: string | null }, id: string, input: Partial<EmployeeInput>) {
  await assertLegalEntityAccess({ tenantId: scope.tenantId, entityId: scope.entityId || undefined });
  const current = await getEmployee(scope, id);
  return prisma.employee.update({
    where: { id: current.id },
    data: {
      firstName: input.firstName ?? current.firstName,
      lastName: input.lastName ?? current.lastName,
      email: input.email ?? current.email,
    },
  });
}

export async function deactivateEmployee(_scope: { tenantId: string; entityId?: string | null }, _id: string) {
  // Schema gap: no status/active field on Employee
  throw Object.assign(new Error("not_supported"), { code: 501 });
}


