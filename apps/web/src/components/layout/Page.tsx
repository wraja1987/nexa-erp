"use client";
import React from "react";

type PageProps = {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export default function Page({ title, actions, children, className="" }: PageProps) {
  return (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      <header className="flex items-center justify-between py-6">
        <h1 className="text-2xl font-semibold tracking-tight">{title ?? ""}</h1>
        <div>{actions}</div>
      </header>
      <main>{children}</main>
    </div>
  );
}
