import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

export function withAuthGuard<P>(Comp: React.ComponentType<P>, roles?: string[]) {
  return function Guarded(props: P) {
    const { data: session, status } = useSession();
    const router = useRouter();
    if (status === "loading") return null;
    const user: any = session?.user;
    if (!user) {
      router.replace(`/login?cb=${encodeURIComponent(router.asPath)}`);
      return null;
    }
    if (roles && !roles.some(r => (user.roles || [user.role]).includes(r))) {
      router.replace("/dashboard?denied=1");
      return null;
    }
    return <Comp {...props} />;
  };
}


