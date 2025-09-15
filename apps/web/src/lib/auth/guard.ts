import { getSession, canViewAdmin } from "./auth";

export async function requireAdmin(section: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthenticated");
  if (!canViewAdmin(section, session.user.role)) throw new Error("Forbidden");
  return session.user;
}

export async function requireAppAccess(module: string) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthenticated");
  // Add fine-grained checks per module if needed
  return session.user;
}
