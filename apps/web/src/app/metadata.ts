import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'VeXeViet - Đặt vé xe khách trực tuyến',
  description: 'Nền tảng đặt vé xe khách hàng đầu Việt Nam',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VeXeViet',
  },
  icons: {
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'msapplication-TileColor': '#1e40af',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e40af',
}
