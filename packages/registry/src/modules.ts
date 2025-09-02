import type { ConnectorStatus } from './connectors'
import { connectorStatus } from './connectors'

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
export type Role = 'superadmin' | 'admin' | 'user'

export interface ModuleEntry {
  key: ModuleKey
  name: string
  status: ConnectorStatus
  rolesAllowed: Role[]
}

export function getModules(): ModuleEntry[] {
  return [
    { key: 'billing', name: 'Billing & Metering (Stripe)', status: connectorStatus('stripe'), rolesAllowed: ['superadmin', 'admin'] },
    { key: 'open_banking', name: 'Open Banking (TrueLayer)', status: connectorStatus('open_banking'), rolesAllowed: ['superadmin', 'admin'] },
    { key: 'hmrc', name: 'HMRC MTD VAT', status: connectorStatus('hmrc'), rolesAllowed: ['superadmin', 'admin'] },
    { key: 'notifications', name: 'Notifications (Twilio)', status: connectorStatus('twilio'), rolesAllowed: ['superadmin', 'admin', 'user'] },
    { key: 'manufacturing', name: 'Manufacturing (APS, Capacity, MRP, Advanced)', status: 'active', rolesAllowed: ['superadmin', 'admin'] },
    { key: 'wms', name: 'Warehouse Management (ASN, Wave Picking, 3PL)', status: 'active', rolesAllowed: ['superadmin', 'admin'] },
    { key: 'purchase_orders', name: 'Purchase Orders', status: 'active', rolesAllowed: ['superadmin', 'admin'] },
    { key: 'enterprise', name: 'Enterprise (Intercompany, Consolidation, Treasury, Analytics)', status: 'active', rolesAllowed: ['superadmin', 'admin'] },
    { key: 'payroll', name: 'Payroll', status: 'active', rolesAllowed: ['superadmin', 'admin'] },
    { key: 'marketplace', name: 'Marketplace / EDI (Amazon, eBay, Shopify)', status: 'active', rolesAllowed: ['superadmin', 'admin', 'user'] },
    { key: 'industry', name: 'Industry Dashboards (Retail, Manufacturing, SaaS, Logistics, Construction, Professional Services)', status: 'active', rolesAllowed: ['superadmin', 'admin', 'user'] },
  ]
}

export function getModule(key: ModuleKey): ModuleEntry | undefined {
  return getModules().find(m => m.key === key)
}

export function isRoleAllowed(key: ModuleKey, role: Role): boolean {
  const mod = getModule(key)
  if (!mod) return false
  return mod.rolesAllowed.includes(role)
}
