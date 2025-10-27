import { ReactNode } from "react";
import "@/styles/auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen auth-gradient flex items-center justify-center">
      {children}
    </div>
  );
}


