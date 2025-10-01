import { getServerSession } from "next-auth/next";
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function getSessionSSR(ctx: GetServerSidePropsContext) {
  const { req, res } = ctx;
  return getServerSession(req, res, authOptions as any);
}

export function requireAuth<T extends { [key:string]:any } = { [key:string]:any }>(
  gssp: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    const session = await getSessionSSR(ctx);
    if (!session) {
      const target = ctx.resolvedUrl || "/";
      return { redirect: { destination: `/login?callbackUrl=${encodeURIComponent(target)}`, permanent: false } };
    }
    return gssp(ctx);
  };
}
