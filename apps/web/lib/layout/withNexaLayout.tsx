import React from "react";
import NexaShell from "@/components/layout/NexaShell";
export function withNexaLayout<P>(title: string, Comp: React.ComponentType<P>) {
  return function Wrapped(props: P) {
    return <NexaShell title={title}><Comp {...props}/></NexaShell>;
  };
}


