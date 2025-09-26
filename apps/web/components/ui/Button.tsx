import * as React from "react";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"ghost" };
export default function Button({ variant="primary", className="", ...props }: Props) {
  const base = variant === "primary" ? "nexa-btn" : "nexa-btn nexa-btn-ghost";
  return <button {...props} className={[base, className].join(" ").trim()} />;
}
