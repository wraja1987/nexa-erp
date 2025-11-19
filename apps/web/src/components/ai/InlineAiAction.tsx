"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { nexaTheme } from "@/styles/theme";

export interface InlineAiActionProps {
  label: string;
  onClick: () => Promise<void> | void;
  disabled?: boolean;
  variant?: "chip" | "button";
}

export function InlineAiAction({ label, onClick, disabled = false, variant = "chip" }: InlineAiActionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "chip") {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
        style={{
          background: nexaTheme.colors.nexaSuccess,
          color: "white",
        }}
        aria-label={label}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">⟳</span>
            Processing...
          </>
        ) : (
          <>
            <span>🤖</span>
            {label}
          </>
        )}
      </button>
    );
  }

  return (
    <Button variant="subtle" size="sm" onClick={handleClick} isLoading={isLoading} disabled={disabled}>
      <span className="flex items-center gap-1.5">
        <span>🤖</span>
        {label}
      </span>
    </Button>
  );
}

