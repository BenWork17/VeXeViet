import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeXeViet Admin',
  description: 'Back-office dashboard for VeXeViet operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
