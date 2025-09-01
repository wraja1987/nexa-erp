export type AppModule = {
  id: string
  title: string
  path: string
  children?: AppModule[]
}

// Phase 4 modules and key submodules. All pages should exist as stubs (200/OK).
export const appModules: AppModule[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard' },
  // New: Stubs guarded by feature flags
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_PAYROLL_STUB ?? 'true') !== 'false'
    ? [{ id: 'payroll', title: 'Payroll (Coming Soon)', path: '/payroll' }]
    : []),
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_OPEN_BANKING_STUB ?? 'true') !== 'false'
    ? [{ id: 'open-banking', title: 'Open Banking (Coming Soon)', path: '/open-banking' }]
    : []),
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_MTD_VAT_STUB ?? 'true') !== 'false'
    ? [{ id: 'mtd-vat', title: 'HMRC MTD VAT (Coming Soon)', path: '/tax/mtd-vat' }]
    : []),
  {
    id: 'industry-packs',
    title: 'Industry Packs',
    path: '/industry',
    children: [
      { id: 'industry-manufacturing', title: 'Manufacturing', path: '/industry/manufacturing' },
      { id: 'industry-construction', title: 'Construction', path: '/industry/construction' },
      { id: 'industry-logistics', title: 'Logistics', path: '/industry/logistics' },
      { id: 'industry-retail', title: 'Retail', path: '/industry/retail' },
      { id: 'industry-professional-services', title: 'Professional Services', path: '/industry/professional-services' },
      { id: 'industry-saas-tech', title: 'SaaS/Tech', path: '/industry/saas-tech' },
    ],
  },
  // WMS Advanced
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_WMS_ADV_STUB ?? 'true') !== 'false'
    ? [{
        id: 'wms-advanced', title: 'Advanced WMS (Coming Soon)', path: '/wms/advanced', children: [
          { id: 'wms-asn', title: 'ASN (Coming Soon)', path: '/wms/asn' },
          { id: 'wms-wave-picking', title: 'Wave Picking (Coming Soon)', path: '/wms/wave-picking' },
          { id: 'wms-3pl', title: '3PL Connectors (Coming Soon)', path: '/wms/3pl-connectors' },
        ]
      }]
    : []),
  // CRM Integrations
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_CRM_DEEP_STUB ?? 'true') !== 'false'
    ? [{ id: 'crm-integrations', title: 'Advanced CRM Integrations (Coming Soon)', path: '/crm/integrations' }]
    : []),
  // Marketplace & Billing
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_MARKETPLACE_STUB ?? 'true') !== 'false'
    ? [{ id: 'marketplace', title: 'Marketplace (Coming Soon)', path: '/marketplace' }]
    : []),
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_BILLING_METERING_STUB ?? 'true') !== 'false'
    ? [{ id: 'billing', title: 'Billing/Metering (Coming Soon)', path: '/billing' }]
    : []),
  {
    id: 'ai-orchestration',
    title: 'AI Orchestration',
    path: '/ai',
    children: [
      { id: 'ai-workflows', title: 'Workflows', path: '/ai/workflows' },
      { id: 'ai-runs', title: 'Runs', path: '/ai/runs' },
      { id: 'ai-audit-logs', title: 'Audit Logs', path: '/ai/audit-logs' },
    ],
  },
  // Advanced Manufacturing
  ...(typeof process !== 'undefined' && (process.env.NEXA_FEATURE_MFG_ADV_STUB ?? 'true') !== 'false'
    ? [{
        id: 'mfg-advanced', title: 'Advanced Manufacturing (Coming Soon)', path: '/manufacturing/advanced', children: [
          { id: 'mfg-mrp', title: 'MRP (Coming Soon)', path: '/manufacturing/mrp' },
          { id: 'mfg-capacity', title: 'Capacity Planning (Coming Soon)', path: '/manufacturing/capacity' },
          { id: 'mfg-aps', title: 'APS (Coming Soon)', path: '/manufacturing/aps' },
        ]
      }]
    : []),
  {
    id: 'enterprise',
    title: 'Enterprise',
    path: '/enterprise',
    children: [
      { id: 'enterprise-entities', title: 'Entities', path: '/enterprise/entities' },
      { id: 'enterprise-intercompany', title: 'Intercompany', path: '/enterprise/intercompany' },
      { id: 'enterprise-consolidation', title: 'Consolidation', path: '/enterprise/consolidation' },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    path: '/integrations',
    children: [
      { id: 'shopify', title: 'Shopify', path: '/integrations/shopify' },
      { id: 'amazon', title: 'Amazon', path: '/integrations/amazon' },
      { id: 'ebay', title: 'eBay', path: '/integrations/ebay' },
      { id: 'hmrc-rti', title: 'HMRC RTI', path: '/integrations/hmrc-rti' },
      { id: 'open-banking', title: 'Open Banking', path: '/integrations/open-banking' },
      { id: 'edi', title: 'EDI', path: '/integrations/edi' },
      { id: 'integrations-health', title: 'Health', path: '/integrations/health' },
      { id: 'integrations-toggles', title: 'Toggles', path: '/integrations/toggles' },
    ],
  },
  {
    id: 'billing',
    title: 'Billing',
    path: '/billing',
    children: [
      { id: 'plans', title: 'Plans', path: '/billing/plans' },
      { id: 'invoices', title: 'Invoices', path: '/billing/invoices' },
      { id: 'subscriptions', title: 'Subscriptions', path: '/billing/subscriptions' },
    ],
  },
  {
    id: 'developer-portal',
    title: 'Developer Portal',
    path: '/dev',
    children: [
      { id: 'api-keys', title: 'API Keys', path: '/dev/api-keys' },
      { id: 'webhooks', title: 'Webhooks', path: '/dev/webhooks' },
      { id: 'openapi', title: 'OpenAPI', path: '/dev/openapi' },
    ],
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    path: '/monitoring',
    children: [
      { id: 'health', title: 'Health', path: '/monitoring/health' },
      { id: 'status', title: 'Status', path: '/monitoring/status' },
      { id: 'backups', title: 'Backups', path: '/monitoring/backups' },
    ],
  },
  { id: 'help', title: 'Help', path: '/help' },
  {
    id: 'settings',
    title: 'Settings',
    path: '/settings',
    children: [
      { id: 'tenants', title: 'Tenants', path: '/settings/tenants' },
      { id: 'entities', title: 'Entities', path: '/settings/entities' },
      { id: 'security', title: 'Security', path: '/settings/security' },
      { id: 'connectors', title: 'Connectors (Coming Soon)', path: '/settings/connectors' },
      { id: 'policies', title: 'Policies', path: '/settings/policies' },
      { id: 'sod-matrix', title: 'SoD Matrix', path: '/settings/sod-matrix' },
    ],
  },
  {
    id: 'help-docs',
    title: 'Help & Docs',
    path: '/help',
    children: [
      { id: 'siem-export', title: 'SIEM Export', path: '/help/siem-export' },
    ],
  },
]


