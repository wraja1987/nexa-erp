import * as React from "react";
export default function Dashboard() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-500">Welcome to Nexa ERP.</p>
    </main>
  );
}

export async function getServerSideProps(ctx) {
  try {
    // Soft auth check here if needed; avoid heavy DB on build.
    // Example (commented to keep build-safe without next-auth in build env):
    // const { getServerSession } = await import("next-auth/next");
    // const { authOptions } = await import("../api/auth/[...nextauth]");
    // const session = await getServerSession(ctx.req, ctx.res, authOptions);
    // if (!session) return { redirect: { destination: "/login", permanent: false } };
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: "/login", permanent: false } };
  }
}
