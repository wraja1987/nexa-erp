'use client';

import { useEffect, useState } from 'react';
import NotAuthorised from '../../../../components/NotAuthorised';

export default function ClientGate() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Use NextAuth's built-in session endpoint to resolve the current user's role
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        const r = data?.user?.role || data?.role || data?.session?.user?.role || null;
        if (!cancelled) setRole(r);
      } catch {
        if (!cancelled) setRole(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Keep DOM minimal while loading
  if (role === null) return <></>;

  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  return isAdmin ? (
    <div className="grid grid-cols-1 gap-4">
      <div role="status" aria-label="reports-ok">Reports OK</div>
    </div>
  ) : (
    <NotAuthorised />
  );
}
