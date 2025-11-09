import { cookies } from "next/headers";

/**
 * Minimal stub:
 * - Trusts role stored by your auth (Playwright logins already create sessions).
 * - ADMIN and SUPER_ADMIN pass for "ui:finance_reports:view".
 * - Others throw to let the page render <NotAuthorised /> with 200.
 */
export async function requirePermissionServer(permission: string) {
  const jar = await cookies();
  const role =
    jar.get("role")?.value ||
    jar.get("x-role")?.value ||
    ""; // adjust if your session exposes role elsewhere

  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  if (permission === "ui:finance_reports:view" && isAdmin) return;

  throw new Error("Not authorised");
}
