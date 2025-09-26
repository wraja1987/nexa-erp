import { ReactNode } from "react";
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}
export function CardHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
      <h2 className="text-sm font-medium text-slate-900">{title}</h2>
      {actions}
    </div>
  );
}
export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 py-4 ${className}`}>{children}</div>;
}







