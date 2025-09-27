import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req as any, ctx.res as any, authOptions as any);
  if (session) {
    return { redirect: { destination: "/dashboard", permanent: false } };
  }
  const cb = encodeURIComponent("http://localhost:3000");
  return { redirect: { destination: "/login?callbackUrl=" + cb, permanent: false } };
};

export default function Index() { return null; }
