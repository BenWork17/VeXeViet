'use client'

import { useEffect } from 'react'
import { OfflineIndicator } from './OfflineIndicator'
import { UpdatePrompt } from './UpdatePrompt'
import { InstallPrompt } from './InstallPrompt'
import { initOfflineStorage } from '@/lib/storage/offlineStorage'

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initOfflineStorage().catch(console.error)
  }, [])

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex w-[min(calc(100%-2rem),28rem)] -translate-x-1/2 flex-col items-center gap-2 lg:bottom-4"
      >
        <OfflineIndicator />
        <UpdatePrompt />
      </div>
      <InstallPrompt />
    </>
  )
}
