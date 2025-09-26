import * as React from "react";
export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={["nexa-card", props.className||""].join(" ")} />;
}
export default Card;
