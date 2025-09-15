export type Role = "superadmin" | "companyadmin";
export const canView = (role: Role, section: string) => {
  if (role === "superadmin") return true;
  const allowed = new Set(["tenants","rbac","audit-logs","backups","keys","quotas","jobs"]);
  return allowed.has(section);
};
