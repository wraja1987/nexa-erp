"use client";

import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#0f172a] mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${error 
              ? "border-[#ef4444] focus:ring-[#ef4444]" 
              : "border-[#e5e7eb] focus:ring-[#2563eb] focus:border-[#2563eb]"
            }
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-[#ef4444]" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-[#6b7280]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

