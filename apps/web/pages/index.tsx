// Auto-generated: SSR index redirect to /login (or /dashboard if signed in) for Pages Router
import type { GetServerSideProps } from "next";

const Index = () => null;
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/auth/options");
    const session = await (getServerSession as any)(ctx.req, ctx.res, authOptions);
    return { redirect: { destination: session ? "/dashboard" : "/login", permanent: false } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
};

export default Index;
