import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeXeViet Admin',
  description: 'Back-office dashboard for VeXeViet operations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alike&family=Lora:wght@400;500&family=Nunito:wght@400;600;700;800&family=Source+Code+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#FAF6EE" />
      </head>
      <body>{children}</body>
    </html>
  );
}
