import React from "react";
export default function Logo({ size=22 }: { size?: number }) {
  return (
    <div className="nexa-logo" style={{ fontSize: size }}>
      <span style={{ color: "var(--nexa-primary)" }}>N</span>exa
    </div>
  );
}
