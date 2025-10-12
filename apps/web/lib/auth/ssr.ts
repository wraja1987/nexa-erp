import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export { getServerSession, authOptions };

export function requireAuthGSSP<P>(fn: GetServerSideProps<P>): GetServerSideProps<P> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions);
    if (!session) return { redirect: { destination: "/login", permanent: false } };
    return fn(ctx);
  };
}

// Back-compat: some pages import `requireAuth` from ssr
export const requireAuth = requireAuthGSSP;
export default requireAuthGSSP;
