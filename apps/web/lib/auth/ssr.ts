import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export { getServerSession, authOptions };

export function requireAuthGSSP<P>(fn: GetServerSideProps<P>): GetServerSideProps<P> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any);
    if (!session) return { redirect: { destination: "/login", permanent: false } };
    return fn(ctx);
  };
}
// Back-compat alias used in some pages
export const requireAuth = requireAuthGSSP;
export default requireAuthGSSP;
