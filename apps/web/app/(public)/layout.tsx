import "../../styles/globals.css";
export const metadata = { title: "Nexa ERP — Public" };
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><link rel="preload" as="image" href="/logo-nexa.png" /></head>
      <body className="min-h-screen nexa-gradient" data-testid="public-gradient">{children}</body>
    </html>
  );
}


