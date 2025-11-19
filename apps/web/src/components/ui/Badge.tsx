"use client";

import { ReactNode } from "react";

export interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  const variantStyles = {
    success: "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20",
    warning: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
    danger: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
    info: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
    neutral: "bg-[#f8fafc] text-[#6b7280] border-[#e5e7eb]",
  };
  
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border
        ${variantStyles[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}

