'use client'

import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface FadeInProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const reduceMotion = prefersReducedMotion === true

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduceMotion
          ? { duration: 0, delay: 0 }
          : { duration: 0.2, ease: 'easeOut', delay }
      }
    >
      {children}
    </motion.div>
  )
}
