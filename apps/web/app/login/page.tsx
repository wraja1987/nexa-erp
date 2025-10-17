import dynamic from "next/dynamic";
const LoginApproved = dynamic(() => import("@/src/features/auth/LoginApproved"), { ssr: false });
export default function Page() {
  return <LoginApproved />;
}