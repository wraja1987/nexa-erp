"use client";
import { useRouter } from "next/navigation";
import { routeForAction } from "@/src/lib/actionRoutes";
export default function ActionRouter({ selector = "[data-action]" }: { selector?: string }) {
  const router = useRouter();
  function onClick(e: MouseEvent) {
    const el = (e.target as HTMLElement)?.closest?.(selector) as HTMLElement | null;
    if (!el) return;
    const action = el.getAttribute("data-action");
    if (!action) return;
    const to = routeForAction(action);
    if (to) { e.preventDefault(); router.push(to); }
  }
  if (typeof window !== "undefined") {
    // @ts-ignore
    if (!window.__nexa_action_router_bound) {
      window.addEventListener("click", onClick as any);
      // @ts-ignore
      window.__nexa_action_router_bound = true;
    }
  }
  return null;
}
