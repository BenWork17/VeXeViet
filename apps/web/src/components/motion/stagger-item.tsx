import * as React from 'react'

const STEP_DELAY = 0.04
const MAX_DELAY_STEPS = 3

export interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  index?: number
}

export function StaggerItem({ children, className, index = 0 }: StaggerItemProps) {
  const steps = Math.min(Math.max(index, 0), MAX_DELAY_STEPS)
  const delay = steps * STEP_DELAY

  return (
    <div
      className={className ? `hn-fade-in ${className}` : 'hn-fade-in'}
      style={delay > 0 ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
