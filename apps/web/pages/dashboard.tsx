import * as React from "react";
export default function Dashboard() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-gray-500">Welcome to Nexa ERP.</p>
    </main>
  );
}

export async function getServerSideProps() {
  try {
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: "/login", permanent: false } };
  }
}
