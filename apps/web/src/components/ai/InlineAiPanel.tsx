"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface InlineAiPanelProps {
  title: string;
  content: ReactNode;
  onClose?: () => void;
  isLoading?: boolean;
}

export function InlineAiPanel({ title, content, onClose, isLoading = false }: InlineAiPanelProps) {
  return (
    <Card className="mt-4">
      <CardHeader
        title={title}
        actions={
          onClose && (
            <Button variant="subtle" size="sm" onClick={onClose}>
              Close
            </Button>
          )
        }
      />
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#2563eb" }}></div>
            <span className="ml-3 text-sm" style={{ color: "#6b7280" }}>
              Processing...
            </span>
          </div>
        ) : (
          <div className="text-sm" style={{ color: "#0f172a" }}>
            {content}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

