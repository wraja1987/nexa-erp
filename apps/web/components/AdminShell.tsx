import * as React from "react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminShellProps {
  title?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AdminShell(props: AdminShellProps) {
  const { title = "Admin", breadcrumb = [], actions, children } = props;
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {breadcrumb.map((b, i) => (
              <span key={i}>
                {b.href ? <a href={b.href}>{b.label}</a> : b.label}
                {i < breadcrumb.length - 1 ? " / " : ""}
              </span>
            ))}
          </div>
          <h1 style={{ margin: "6px 0 0", fontSize: 18, fontWeight: 700 }}>{title}</h1>
        </div>
        <div>{actions}</div>
      </div>
      <div className="nexa-card" style={{ padding: 16 }}>{children}</div>
    </div>
  );
}




