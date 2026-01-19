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
      <OfflineIndicator />
      <UpdatePrompt />
      <InstallPrompt />
    </>
  )
}
