export { getServerSession } from "next-auth";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function requireAuthGSSP<P>(ctx: GetServerSidePropsContext, fn: () => Promise<GetServerSidePropsResult<P>>) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } } as GetServerSidePropsResult<P>;
  }
  return fn();
}

// Backwards-compatible helper used by existing pages: requireAuth(async () => ({ props: {} }))
export function requireAuth<T extends { [key: string]: any } = { [key: string]: any }>(
  gssp: (ctx: GetServerSidePropsContext) => Promise<GetServerSidePropsResult<T>>
) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
    if (!session) {
      return { redirect: { destination: "/login", permanent: false } } as GetServerSidePropsResult<T>;
    }
    return gssp(ctx);
  };
}


