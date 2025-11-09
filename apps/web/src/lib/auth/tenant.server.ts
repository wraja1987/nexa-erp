export type SessionContext = { tenantId: string; userId: string; role?: string };

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function getSessionContext(): Promise<SessionContext> {
  const session = await getServerSession(authOptions as any);
  const user = (session as any)?.user || {};
  const tenantId = (user.tenant_id || user.tenantId || null) as string | null;
  const userId = (user.id || "unknown") as string;
  const role = (user.role || undefined) as string | undefined;
  if (!tenantId) throw new Error("Unauthenticated");
  return { tenantId, userId, role };
}

export async function assertTenantScope(requestTenantId?: string): Promise<SessionContext> {
  const ctx = await getSessionContext();
  if (process.env.NODE_ENV === "production") {
    if (requestTenantId && requestTenantId !== ctx.tenantId) throw new Error("Forbidden");
  }
  return ctx;
}
