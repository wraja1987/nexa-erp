import React from "react";
export function MaintenanceBanner() {
  if (typeof window === "undefined") return null;
  const active = (process.env.NEXT_PUBLIC_RUNTIME_MAINT ?? "false") === "true";
  if (!active) return null;
  const msg = process.env.NEXT_PUBLIC_MAINT_MSG ?? "Scheduled maintenance";
  return (
    <div role="status" aria-live="polite" className="w-full text-center p-2 text-sm bg-yellow-100">
      {msg}
    </div>
  );
}
