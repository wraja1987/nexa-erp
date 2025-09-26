"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import SiteFooter from "./SiteFooter";

export default function ClientHeaderGate() {
  const pathname = usePathname() || "";
  const hideHeader = pathname.startsWith("/app") || pathname.startsWith("/admin") || pathname.startsWith("/auth");
  if (hideHeader) return null;
  return <>
    <Header />
    <SiteFooter />
  </>;
}


