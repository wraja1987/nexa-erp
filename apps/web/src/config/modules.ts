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
    ],
  },
]


