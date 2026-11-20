import './globals.css'
import type { CSSProperties } from 'react'
import { Alike, Lora, Nunito, Source_Code_Pro } from 'next/font/google'
import { StoreProvider } from '@/store/StoreProvider'
import { QueryProvider } from './providers'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'
import { ToastProvider } from '@/components/error/ToastProvider'
import { PWAProvider } from '@/components/pwa'
import { ThemeProvider } from '@/components/theme'
import { LayoutContent } from './LayoutContent'

export { metadata, viewport } from './metadata'

const nunito = Nunito({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-nunito',
})

const alike = Alike({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  display: 'swap',
  variable: '--font-alike',
})

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-lora',
})

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-source-code-pro',
})

const fontVariablesStyle = {
  '--font-sans': 'var(--font-nunito), ui-sans-serif, system-ui, sans-serif',
  '--font-display': 'var(--font-alike), var(--font-lora), ui-serif, Georgia, serif',
  '--font-mono': 'var(--font-source-code-pro), ui-monospace, SFMono-Regular, monospace',
} as CSSProperties

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
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${nunito.variable} ${alike.variable} ${lora.variable} ${sourceCodePro.variable}`}
      style={fontVariablesStyle}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/apple-touch-icon-120x120.png" />
        <meta name="theme-color" content="#FAF9F7" />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground font-sans transition-colors duration-200">
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
