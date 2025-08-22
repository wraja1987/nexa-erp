export type AppModule = {
  id: string
  title: string
  path: string
  children?: AppModule[]
}

// Phase 4 modules and key submodules. All pages should exist as stubs (200/OK).
export const appModules: AppModule[] = [
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard' },
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


