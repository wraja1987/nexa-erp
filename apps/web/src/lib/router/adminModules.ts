export type AdminModule = { slug: string; label: string };

export const adminModules: AdminModule[] = [
  { slug: "dashboard", label: "Dashboard" },
  { slug: "tenants", label: "Tenants" },
  { slug: "rbac", label: "Users & Roles" },
  { slug: "audit-logs", label: "Audit Logs" },
  { slug: "backups", label: "Backups & DR" },
  { slug: "keys", label: "API Keys & Rate Limits" },
  { slug: "quotas", label: "Quotas" },
  { slug: "jobs", label: "Jobs & Alerts" },
];


