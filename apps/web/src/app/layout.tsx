import './globals.css'
import 'react-day-picker/dist/style.css'
import { Header } from '@/layouts/Header/Header'
import { Footer } from '@/layouts/Footer/Footer'
import { StoreProvider } from '@/store/StoreProvider'
import { QueryProvider } from './providers'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ToastProvider } from '@/components/error/ToastProvider'
import { PWAProvider } from '@/components/pwa'
import { ThemeProvider } from '@/components/theme'
import { LayoutContent } from './LayoutContent'

export { metadata, viewport } from './metadata'

const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('vexeviet-theme');
    var resolved = theme;
    if (!theme || theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body className="flex min-h-screen flex-col font-sans transition-colors duration-200">
        <ErrorBoundary>
          <QueryProvider>
            <StoreProvider>
              <ThemeProvider>
                <ToastProvider>
                  <PWAProvider>
                    <LayoutContent>{children}</LayoutContent>
                  </PWAProvider>
                </ToastProvider>
              </ThemeProvider>
            </StoreProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
