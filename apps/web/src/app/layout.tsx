import './globals.css';
import { inter } from '@/lib/fonts';
export const metadata = { title: 'Nexa', description: 'ERP' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
