import type { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

const Index = () => null;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
    return { redirect: { destination: session ? "/dashboard" : "/login", permanent: false } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};

export default Index;
