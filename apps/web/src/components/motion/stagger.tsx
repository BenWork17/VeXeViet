'use client'

import * as React from 'react'

export interface StaggerProps {
  children: React.ReactNode
  className?: string
}

export function Stagger({ children, className }: StaggerProps) {
  return <div className={className}>{children}</div>
}
