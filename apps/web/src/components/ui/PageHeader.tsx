"use client";

import { ReactNode } from "react";
import { Button } from "./Button";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="px-8 pt-8 pb-4">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="text-sm mb-2" style={{ color: "#6b7280" }}>
          {breadcrumb.map((item, index) => (
            <span key={index}>
              {item.href ? (
                <a href={item.href} className="hover:underline">{item.label}</a>
              ) : (
                <span>{item.label}</span>
              )}
              {index < breadcrumb.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" style={{ color: "#0f172a" }}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

