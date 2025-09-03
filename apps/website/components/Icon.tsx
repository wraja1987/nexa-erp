"use client";
import * as React from "react";
import * as Lucide from "lucide-react";

type Props = { name?: string; className?: string };
export default function Icon({ name, className }: Props) {
  if (!name) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Cmp = (Lucide as any)[name] as React.ComponentType<any>;
  if (!Cmp) return null;
  return <Cmp aria-hidden className={className} />;
}
