/** Basic auth session + RBAC helpers (replace with your SSO / NextAuth provider). */
export type Role = "user" | "companyadmin" | "superadmin";
export type Session = { user: { id: string; email: string; role: Role; tenantId?: string } } | null;

/** Replace with real session lookup (e.g. NextAuth getServerSession). */
export async function getSession(): Promise<Session> {
  // TODO: wire real auth here.
  return { user: { id: "demo", email: "demo@nexa.local", role: "superadmin", tenantId: "t-demo" } };
}

export function assertRole(role: Role, allowed: Role[]) {
  if (!allowed.includes(role)) throw new Error("Forbidden");
}

export function canViewAdmin(section: string, role: Role) {
  if (role === "superadmin") return true;
  const allowed = new Set(["dashboard","tenants","rbac","audit-logs","backups","keys","quotas","jobs"]);
  return role === "companyadmin" && allowed.has(section);
}
