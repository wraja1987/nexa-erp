export type Role = "SUPER_ADMIN" | "ADMIN" | "USER";
export function requireAuth(ctx?: any) {
  return { userId: "demo-user", role: "ADMIN" as Role };
}
