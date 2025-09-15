export type Role = "superadmin" | "admin" | "finance" | "wms" | "manufacturing" | "sales" | "pos" | "viewer" | "user";

/**
 * Minimal current user stub used in demo/e2e contexts
 */
export function currentUser() {
  return { id: "demo", roles: ["admin", "pos"] as Role[] };
}

/**
 * Extract a role from the incoming request headers. Falls back to "user".
 */
export function getRoleFromRequest(req: Request): Role {
  const headerValue = (req.headers.get("x-role") || "user").toLowerCase();
  const allowed: Role[] = [
    "superadmin",
    "admin",
    "finance",
    "wms",
    "manufacturing",
    "sales",
    "pos",
    "viewer",
    "user",
  ];
  return (allowed as string[]).includes(headerValue) ? (headerValue as Role) : "user";
}

type GuardResult = { ok: boolean };

/**
 * Map a logical module to roles that are permitted to access it.
 * This is intentionally permissive for demo tests: admin is always allowed.
 */
const moduleRoleMap: Record<string, Role[]> = {
  enterprise: ["admin", "finance"],
  finance: ["admin", "finance"],
  billing: ["admin", "finance"],
  payroll: ["admin", "finance"],
  wms: ["admin", "wms"],
  manufacturing: ["admin", "manufacturing"],
  marketplace: ["admin", "sales"],
  notifications: ["admin"],
  purchase_orders: ["admin"],
  pos: ["admin", "pos", "user"], // allow user for POS flows in tests
};

/**
 * Overload 1: ensureRoleAllowed(module, role)
 */
export function ensureRoleAllowed(module: string, role: Role): GuardResult;
/**
 * Overload 2: ensureRoleAllowed(req, allowedRoles)
 */
export function ensureRoleAllowed(req: Request, allowedRoles: Role[]): GuardResult;
export function ensureRoleAllowed(a: string | Request, b: Role | Role[]): GuardResult {
  if (typeof a !== "string") {
    const req = a as Request;
    const allowed = b as Role[];
    const role = getRoleFromRequest(req);
    return { ok: role === "admin" || role === "superadmin" || allowed.includes(role) };
  }
  const moduleName = a as string;
  const role = b as Role;
  const allowed = moduleRoleMap[moduleName] || ["admin"];
  return { ok: role === "admin" || role === "superadmin" || allowed.includes(role) };
}

/**
 * Simple permission check helper. Admin is permitted to perform all actions.
 */
export function ensurePermissionAllowed(permission: string, role: Role): GuardResult {
  if (role === "admin") return { ok: true };
  // Minimal defaults for tests: payroll permissions require finance
  if (permission.startsWith("payroll:")) return { ok: role === "finance" };
  // Default deny for unknown permissions
  return { ok: false };
}

/**
 * Extract an actor id from request headers. Used for audit logs in tests.
 */
export function getActorIdFromRequest(req: Request): string {
  return req.headers.get("x-actor-id") || req.headers.get("x-session") || "anon";
}

/**
 * Legacy helper kept for compatibility in a few places.
 */
export function assertPerm(u: { id: string; roles: Role[] }, role: Role) {
  if (!u?.roles?.includes(role)) throw Object.assign(new Error("Forbidden"), { code: "FORBIDDEN" });
}
