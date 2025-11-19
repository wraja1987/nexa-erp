"use client";

import { ReactNode } from "react";
import { nexaTheme } from "@/styles/theme";

export interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div 
      className={`rounded-2xl border bg-white ${className}`}
      style={{
        borderRadius: nexaTheme.radius["2xl"],
        boxShadow: nexaTheme.shadows.card,
        borderColor: nexaTheme.colors.nexaBorder,
      }}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function CardHeader({ title, subtitle, actions }: CardHeaderProps) {
  return (
    <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#e5e7eb" }}>
      <div>
        {title && <h2 className="text-lg font-semibold" style={{ color: nexaTheme.colors.nexaText }}>{title}</h2>}
        {subtitle && <p className="text-sm mt-1" style={{ color: nexaTheme.colors.nexaMutedText }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t flex items-center justify-between ${className}`} style={{ borderColor: "#e5e7eb" }}>
      {children}
    </div>
  );
}


