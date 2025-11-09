import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { headers } from "next/headers";
import { hasPermission, normalizeRole, AppRole } from "@/lib/rbac/matrix";

export async function requirePermissionServer(perm: string): Promise<{ userId: string; role: AppRole }> {
  const hdrs = headers();
  const roleOverride = hdrs.get("x-role");
  if (process.env.NODE_ENV !== "production" && roleOverride) {
    const role = normalizeRole(roleOverride);
    if (!hasPermission(role, perm)) throw Object.assign(new Error("Forbidden"), { code: 403 });
    return { userId: "e2e", role };
  }

  const session = await getServerSession(authOptions as any);
  const user = (session as any)?.user;
  if (!user) throw Object.assign(new Error("Unauthenticated"), { code: 401 });
  const role = normalizeRole(user.role);
  if (!hasPermission(role, perm)) throw Object.assign(new Error("Forbidden"), { code: 403 });
  return { userId: user.id ?? "unknown", role };
}


