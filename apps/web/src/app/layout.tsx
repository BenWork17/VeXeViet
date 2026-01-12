import './globals.css'
import 'react-day-picker/dist/style.css'
import { Header } from '@/layouts/Header/Header'
import { Footer } from '@/layouts/Footer/Footer'
import { StoreProvider } from '@/store/StoreProvider'

export { metadata, viewport } from './metadata'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  )
}
