// Server wrapper (Next.js 15-safe)
export const dynamic = "force-dynamic";
export const revalidate = 0;

import POSClient from "./POSClient";

export default function POSPage() {
  return <POSClient />;
}
