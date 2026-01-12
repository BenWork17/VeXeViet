import './globals.css'
import { Header } from '@/layouts/Header/Header'
import { Footer } from '@/layouts/Footer/Footer'

export { metadata, viewport } from './metadata'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
