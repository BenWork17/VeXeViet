'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface VietnamFlagIconProps {
  /** Visual size preset maintaining exact 3:2 flag proportions */
  size?: 'sm' | 'md' | 'lg'
  /** Additional classes for the outer emblem container */
  className?: string
  /** Optional accessible label; defaults to decorative when inside a labeled brand link */
  label?: string
}

const SIZE_MAP = {
  sm: { width: 33, height: 22, radius: 'rounded-[5px]' },
  md: { width: 42, height: 28, radius: 'rounded-[6px]' },
  lg: { width: 48, height: 32, radius: 'rounded-[7px]' },
} as const

/**
 * Authentic 3:2 Vietnamese national flag emblem with mathematically exact
 * 5-pointed golden star, silk-fabric lighting, ambient wave shimmer, and
 * interactive hover flutter. Respects `prefers-reduced-motion`.
 */
export function VietnamFlagIcon({
  size = 'md',
  className = '',
  label,
}: VietnamFlagIconProps) {
  const uid = useId().replace(/:/g, '')
  const prefersReducedMotion = useReducedMotion()
  const { width, height, radius } = SIZE_MAP[size]

  const clipId = `vn-flag-clip-${uid}`
  const redGradId = `vn-flag-red-${uid}`
  const waveFoldId = `vn-flag-fold-${uid}`
  const starGradId = `vn-flag-star-${uid}`
  const starGlowId = `vn-flag-glow-${uid}`
  const specularId = `vn-flag-spec-${uid}`

  const isDecorative = !label

  return (
    <motion.span
      className={[
        'vn-flag-emblem relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden',
        radius,
        'ring-1 ring-[#991B1B]/18 shadow-[0_1px_4px_rgba(218,37,29,0.16),0_1px_2px_rgba(0,0,0,0.06)]',
        'transition-shadow duration-300 group-hover:shadow-[0_3px_10px_rgba(218,37,29,0.24),0_1px_3px_rgba(255,205,0,0.16)]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        height,
        perspective: 220,
        transformStyle: 'preserve-3d',
      }}
      role={isDecorative ? undefined : 'img'}
      aria-label={label}
      aria-hidden={isDecorative ? 'true' : undefined}
      initial={false}
      whileHover={
        prefersReducedMotion
          ? undefined
          : {
              scale: 1.06,
              y: -1,
              rotateY: [0, -7, 5, -2, 0],
              rotateZ: [0, -1.2, 0.8, 0],
              transition: {
                scale: { type: 'spring', stiffness: 420, damping: 22 },
                y: { type: 'spring', stiffness: 420, damping: 22 },
                rotateY: { duration: 0.75, ease: 'easeInOut' },
                rotateZ: { duration: 0.75, ease: 'easeInOut' },
              },
            }
      }
      whileTap={
        prefersReducedMotion
          ? undefined
          : {
              scale: 0.97,
              y: 0,
            }
      }
    >
      <style>{`
        @keyframes vn-flag-silk-shimmer {
          0%, 100% {
            transform: translateX(-135%) skewX(-18deg);
            opacity: 0;
          }
          18% {
            opacity: 0.55;
          }
          48% {
            transform: translateX(145%) skewX(-18deg);
            opacity: 0;
          }
          49%, 99% {
            transform: translateX(-135%) skewX(-18deg);
            opacity: 0;
          }
        }

        @keyframes vn-flag-wave-ripple {
          0%, 100% {
            transform: translateX(0%) scaleX(1);
          }
          50% {
            transform: translateX(-6%) scaleX(1.04);
          }
        }

        .vn-flag-emblem .vn-flag-shimmer {
          animation: vn-flag-silk-shimmer 5.6s ease-in-out infinite;
        }

        .vn-flag-emblem .vn-flag-fold-layer {
          animation: vn-flag-wave-ripple 4.2s ease-in-out infinite;
          transform-origin: center;
        }

        .vn-flag-emblem .vn-flag-star-group {
          transform-origin: 45px 30px;
          transition: transform 280ms cubic-bezier(0.22, 1, 0.36, 1), filter 280ms ease;
        }

        .group:hover .vn-flag-emblem .vn-flag-star-group,
        .vn-flag-emblem:hover .vn-flag-star-group {
          transform: scale(1.08);
          filter: drop-shadow(0 0 3.5px rgba(255, 224, 102, 0.85));
        }

        .group:hover .vn-flag-emblem .vn-flag-fold-layer,
        .vn-flag-emblem:hover .vn-flag-fold-layer {
          animation-duration: 2.1s;
        }

        @media (prefers-reduced-motion: reduce) {
          .vn-flag-emblem .vn-flag-shimmer,
          .vn-flag-emblem .vn-flag-fold-layer {
            animation: none !important;
          }
          .vn-flag-emblem .vn-flag-star-group {
            transition: none !important;
          }
          .group:hover .vn-flag-emblem .vn-flag-star-group,
          .vn-flag-emblem:hover .vn-flag-star-group {
            transform: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 90 60"
        width={width}
        height={height}
        fill="none"
        focusable="false"
        className="block h-full w-full"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width="90" height="60" />
          </clipPath>

          {/* Rich authentic crimson red (#DA251D) with subtle flat-editorial silk depth */}
          <linearGradient id={redGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DF2920" />
            <stop offset="52%" stopColor="#DA251D" />
            <stop offset="100%" stopColor="#CB1F17" />
          </linearGradient>

          {/* Subtle silk wave highlight & shadow folds */}
          <linearGradient id={waveFoldId} x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.06" />
            <stop offset="24%" stopColor="#000000" stopOpacity="0.05" />
            <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.10" />
            <stop offset="74%" stopColor="#000000" stopOpacity="0.06" />
            <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
          </linearGradient>

          {/* Luminous golden yellow star (#FFCD00 -> #FFE066) */}
          <linearGradient id={starGradId} x1="25%" y1="10%" x2="80%" y2="95%">
            <stop offset="0%" stopColor="#FFE970" />
            <stop offset="45%" stopColor="#FFD819" />
            <stop offset="85%" stopColor="#FFCD00" />
            <stop offset="100%" stopColor="#F5BD00" />
          </linearGradient>

          {/* Subtle crisp shadow behind the golden star */}
          <filter id={starGlowId} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow
              dx="0"
              dy="0.7"
              stdDeviation="0.85"
              floodColor="#6E0B06"
              floodOpacity="0.22"
            />
          </filter>

          {/* Soft editorial top finish (toned-down bevel) */}
          <linearGradient id={specularId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.13" />
            <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.04" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${clipId})`}>
          {/* Crimson field */}
          <rect x="0" y="0" width="90" height="60" fill={`url(#${redGradId})`} />

          {/* Animated gentle silk-wave shading */}
          <rect
            x="-6"
            y="0"
            width="102"
            height="60"
            fill={`url(#${waveFoldId})`}
            className="vn-flag-fold-layer"
          />

          {/* Mathematically exact 5-pointed golden star centered at (45, 30), R = 18 */}
          <g className="vn-flag-star-group" filter={`url(#${starGlowId})`}>
            <polygon
              points="45.00,12.00 49.04,24.44 62.12,24.44 51.54,32.12 55.58,44.56 45.00,36.88 34.42,44.56 38.46,32.12 27.88,24.44 40.96,24.44"
              fill={`url(#${starGradId})`}
              stroke="#FFF6B3"
              strokeWidth="0.35"
              strokeLinejoin="miter"
            />
          </g>

          {/* Subtle enamel/silk top specular finish */}
          <rect
            x="0"
            y="0"
            width="90"
            height="60"
            fill={`url(#${specularId})`}
            pointerEvents="none"
          />

          {/* Subtle inner hairline */}
          <rect
            x="0.75"
            y="0.75"
            width="88.5"
            height="58.5"
            rx="5"
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.12"
            strokeWidth="0.8"
            pointerEvents="none"
          />
        </g>
      </svg>

      {/* Ambient diagonal light shimmer gliding across the silk surface */}
      {!prefersReducedMotion && (
        <span
          aria-hidden="true"
          className="vn-flag-shimmer pointer-events-none absolute inset-y-0 left-0 w-[44%] bg-gradient-to-r from-transparent via-white/45 to-transparent"
        />
      )}
    </motion.span>
  )
}
