export type Role = 'superadmin' | 'admin' | 'user'
export type ModuleKey =
  | 'billing'
  | 'open_banking'
  | 'hmrc'
  | 'notifications'
  | 'manufacturing'
  | 'wms'
  | 'purchase_orders'
  | 'enterprise'
  | 'payroll'
  | 'marketplace'
  | 'industry'

const allowedRolesByModule: Record<ModuleKey, Role[]> = {
  billing: ['superadmin', 'admin'],
  open_banking: ['superadmin', 'admin'],
  hmrc: ['superadmin', 'admin'],
  notifications: ['superadmin', 'admin', 'user'],
  manufacturing: ['superadmin', 'admin'],
  wms: ['superadmin', 'admin'],
  purchase_orders: ['superadmin', 'admin'],
  enterprise: ['superadmin', 'admin'],
  payroll: ['superadmin', 'admin'],
  marketplace: ['superadmin', 'admin', 'user'],
  industry: ['superadmin', 'admin', 'user'],
}

function isRoleAllowedLocal(moduleKey: ModuleKey, role: Role): boolean {
  const roles = allowedRolesByModule[moduleKey]
  return Array.isArray(roles) ? roles.includes(role) : false
}

export function getRoleFromRequest(req: Request): Role {
  const hdr = (req.headers.get('x-role') || '').toLowerCase()
  if (hdr === 'superadmin' || hdr === 'admin' || hdr === 'user') return hdr as Role
  // default to lowest privilege if not provided
  return 'user'
}

export function ensureRoleAllowed(moduleKey: ModuleKey, role: Role): { ok: true } | { ok: false; reason: string } {
  if (!isRoleAllowedLocal(moduleKey, role)) {
    return { ok: false, reason: 'access_denied' }
  }
  return { ok: true }
}


