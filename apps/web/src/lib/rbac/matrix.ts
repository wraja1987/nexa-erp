export type AppRole = "SUPER_ADMIN" | "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";

export const ALL_ROLES: AppRole[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "STAFF", "VIEWER"];

export function normalizeRole(input?: string | null): AppRole {
  const v = String(input || "VIEWER").toUpperCase();
  if ((ALL_ROLES as string[]).includes(v)) return v as AppRole;
  if (v === "SUPERADMIN" || v === "SUPER-ADMIN") return "SUPER_ADMIN";
  if (v === "USER") return "VIEWER";
  return "VIEWER";
}

// Permission matrix (expand as needed)
export const matrix: Record<string, AppRole[]> = {
  "finance:approve_invoice": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "finance:record_payment": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  // Finance GL & ops
  "finance:post_journal": ["ADMIN", "SUPER_ADMIN"],
  "finance:vat_submit": ["ADMIN", "SUPER_ADMIN"],
  "finance:fa_depreciate": ["ADMIN", "SUPER_ADMIN"],
  "finance:fa_dispose": ["ADMIN", "SUPER_ADMIN"],
  "inventory:receive_grn": ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"],
  "inventory:valuation_post_cogs": ["ADMIN", "SUPER_ADMIN"],
  "mfg:consume_bom": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "mfg:cost_rollup": ["ADMIN", "SUPER_ADMIN"],
  // HR/Payroll
  "hr:payroll_run": ["ADMIN", "SUPER_ADMIN"],
  "pos:finalise_sale": ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"],
  "projects:timesheet_rollup": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  // Admin actions
  "admin:role_change": ["ADMIN", "SUPER_ADMIN"],
  // Admin routes
  "ui:finance_reports:view": ["ADMIN", "SUPER_ADMIN"],
  "ui:admin:view": ["ADMIN", "SUPER_ADMIN"],
  "ui:admin:manage": ["ADMIN", "SUPER_ADMIN"],
  "ui:admin:super": ["SUPER_ADMIN"],
  "ui:healthcare:view": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "ui:healthcare:admin": ["ADMIN", "SUPER_ADMIN"],
  "ui:attachments:view": ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"],
  "ui:attachments:edit": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  // Workflow permissions (Phase 24)
  "ui:workflow:view": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "ui:workflow:admin": ["ADMIN", "SUPER_ADMIN"],
  // Custom Fields permissions (Phase 25)
  "ui:customfields:view": ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"],
  "ui:customfields:admin": ["ADMIN", "SUPER_ADMIN"],
  // Planning / S&OP permissions (Phase 26)
  "ui:planning:view": ["ADMIN", "MANAGER", "STAFF", "SUPER_ADMIN"],
  "ui:planning:admin": ["ADMIN", "SUPER_ADMIN"],
  // User Management permissions (Phase 27)
  "ui:superadmin:portal": ["SUPER_ADMIN"],
  "ui:admin:users": ["ADMIN", "SUPER_ADMIN"],
  "ui:admin:rbac": ["ADMIN", "SUPER_ADMIN"],
  // Agent AI permissions (Phase 28)
  "ui:ai:admin": ["ADMIN", "SUPER_ADMIN"],
  "ui:ai:finance": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "ui:ai:inventory": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "ui:ai:planning": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
  "ui:ai:analytics": ["ADMIN", "MANAGER", "SUPER_ADMIN"],
};

export function hasPermission(role: AppRole, perm: string): boolean {
  if (role === "SUPER_ADMIN") return true;
  const allowed = matrix[perm];
  if (!allowed) return false; // explicit deny for unknown permissions
  return allowed.includes(role);
}


