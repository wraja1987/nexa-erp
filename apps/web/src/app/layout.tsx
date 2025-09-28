export const metadata = { title: "Nexa ERP", description: "Nexa ERP Portal" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
