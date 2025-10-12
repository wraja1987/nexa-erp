// Minimal SSR guard shim used by pages that import @/lib/auth/ssr
import type { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export function requireAuth<T extends { [key: string]: any } = { [key: string]: any }>(
  gssp: GetServerSideProps<T>
): GetServerSideProps<T> {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
    return gssp(ctx);
  };
}


