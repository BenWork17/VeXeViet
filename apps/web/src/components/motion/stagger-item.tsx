'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const STEP_DELAY = 0.04
const MAX_DELAY_STEPS = 3

export interface StaggerItemProps {
  children: React.ReactNode
  className?: string
  index?: number
}

export function StaggerItem({ children, className, index = 0 }: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = prefersReducedMotion === true
  const steps = Math.min(Math.max(index, 0), MAX_DELAY_STEPS)

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0, delay: 0 }
          : { duration: 0.2, ease: 'easeOut', delay: steps * STEP_DELAY }
      }
    >
      {children}
    </motion.div>
  )
}
