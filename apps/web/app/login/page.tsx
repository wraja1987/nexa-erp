export const dynamic = "force-dynamic";
export const revalidate = 0;

import NextDynamic from "next/dynamic";
const LoginApproved = NextDynamic(() => import("@/src/features/auth/LoginApproved"), { ssr: false });
export default function Page() {
  return <LoginApproved />;
}