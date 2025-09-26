export const dynamic = "force-dynamic";
import "../styles/nexa-v2.css";
export default function RootLayout({ children }: { children: any }) {
  return (<html lang="en"><body>{children}</body></html>);
}
