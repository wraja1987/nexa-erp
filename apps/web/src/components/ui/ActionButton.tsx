"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";

interface ActionButtonProps {
  label: string;
  onClick: () => Promise<any>;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  children?: ReactNode;
}

export function ActionButton({
  label,
  onClick,
  variant = "primary",
  disabled = false,
  onSuccess,
  onError,
  children,
}: ActionButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await onClick();
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e: any) {
      const errorMsg = e?.message || String(e) || "Action failed";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant={variant}
        onClick={handleClick}
        disabled={disabled || loading}
        isLoading={loading}
      >
        {children || label}
      </Button>
      {error && (
        <div className="text-xs text-red-600">{error}</div>
      )}
    </div>
  );
}

