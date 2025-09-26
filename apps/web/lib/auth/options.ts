import type { NextAuthOptions } from "next-auth";
export function buildAuthConfig(): NextAuthOptions {
  return {
    providers: [],
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET || "dev",
  } as NextAuthOptions;
}
export const authOptions: NextAuthOptions = buildAuthConfig();
