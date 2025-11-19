"use client";

import { ReactNode } from "react";

export interface AlertProps {
  variant?: "error" | "warning" | "info" | "success";
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "info", title, children, className = "" }: AlertProps) {
  const variantStyles = {
    error: "bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]",
    warning: "bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]",
    info: "bg-[#3b82f6]/10 border-[#3b82f6] text-[#3b82f6]",
    success: "bg-[#10b981]/10 border-[#10b981] text-[#10b981]",
  };
  
  return (
    <div
      className={`
        rounded-lg border p-4
        ${variantStyles[variant]} ${className}
      `}
      role="alert"
    >
      {title && (
        <h3 className="font-semibold mb-1.5">{title}</h3>
      )}
      <div className="text-sm">{children}</div>
    </div>
  );
}

