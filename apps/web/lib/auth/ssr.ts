import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./options";

export { getServerSession, authOptions };

/** Wrap a GSSP to require an authenticated session; redirect to /login if missing. */
export function requireAuthGSSP<P>(
  fn: GetServerSideProps<P>
): GetServerSideProps<P> {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions);
    if (!session) {
      return { redirect: { destination: "/login", permanent: false } };
    }
    return fn(ctx);
  };
}

// Back-compat: some code imports `requireAuth` from this module.
export const requireAuth = requireAuthGSSP;
export default requireAuthGSSP;
