export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextDynamic from "next/dynamic";
const ApprovedLogin = NextDynamic(() => import("@/src/features/auth/ApprovedLogin"), { ssr: false });
export default function Page() {
  return <ApprovedLogin />;
}