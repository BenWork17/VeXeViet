'use client'

import { useEffect, useId, useRef } from 'react'

export type WatermarkVariant = 'dong-son' | 'lotus' | 'route-ribbon' | 'heritage-lattice'

export interface CardWatermarkProps {
  variant: WatermarkVariant
  position?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left' | 'full'
  className?: string
}

/**
 * Magic UI / Aceternity UI–inspired architectural background patterns with
 * Vietnamese heritage geometry & 120fps cursor-tracking spotlight reveal.
 *
 * Layer 1 (Base): Crisp, low-contrast micro-pattern across the full card frame.
 * Layer 2 (Spotlight Hover Reveal): Vivid warm-orange pattern + radial glow
 * dynamically revealed under the user's cursor as it moves across the card.
 */

function DongSonPatternLayer({ idPrefix, isSpotlight }: { idPrefix: string; isSpotlight?: boolean }) {
  const gridId = `${idPrefix}-ds-grid-${isSpotlight ? 'spot' : 'base'}`
  // Highlighted cells (Magic UI GridPattern squares style)
  const squares: [number, number][] = [
    [1, 1],
    [4, 2],
    [7, 1],
    [11, 3],
    [14, 1],
    [18, 2],
    [22, 1],
    [2, 5],
    [9, 4],
    [16, 5],
    [21, 4],
  ]

  // 16-ray precision guilloche sunburst for the Dong Son medallion
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * 22.5 * Math.PI) / 180
    const a1 = ((i * 22.5 - 6) * Math.PI) / 180
    const a2 = ((i * 22.5 + 6) * Math.PI) / 180
    const rIn = 18
    const rOut = 48
    return `M ${(rIn * Math.cos(a1)).toFixed(1)} ${(rIn * Math.sin(a1)).toFixed(1)} L ${(rOut * Math.cos(angle)).toFixed(1)} ${(rOut * Math.sin(angle)).toFixed(1)} L ${(rIn * Math.cos(a2)).toFixed(1)} ${(rIn * Math.sin(a2)).toFixed(1)}`
  }).join(' ')

  return (
    <svg width="100%" height="100%" className="h-full w-full" shapeRendering="geometricPrecision" focusable="false">
      <defs>
        <pattern id={gridId} width="36" height="36" patternUnits="userSpaceOnUse" x="-1" y="-1">
          <path d="M.5 36V.5H36" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="0" />
          <circle cx="0.5" cy="0.5" r="1.2" fill="currentColor" fillOpacity={isSpotlight ? '0.65' : '0.35'} />
        </pattern>
      </defs>

      {/* Full-card Magic UI architectural grid */}
      <rect width="100%" height="100%" fill={`url(#${gridId})`} />

      {/* Highlighted grid cells */}
      <svg x="-1" y="-1" className="overflow-visible">
        {squares.map(([gx, gy]) => (
          <rect
            key={`${gx}-${gy}`}
            width="35"
            height="35"
            x={gx * 36 + 1}
            y={gy * 36 + 1}
            fill="currentColor"
            fillOpacity={isSpotlight ? '0.14' : '0.055'}
            strokeWidth="0"
          />
        ))}
      </svg>

      {/* Precision Dong Son guilloche compass rings anchored at right & top-left */}
      <svg viewBox="0 0 800 320" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {[
          { cx: 710, cy: 160, scale: 1.35 },
          { cx: 86, cy: 56, scale: 0.9 },
        ].map(({ cx, cy, scale }, idx) => (
          <g key={idx} transform={`translate(${cx} ${cy}) scale(${scale})`} fill="none">
            <circle cx="0" cy="0" r="11" fill="currentColor" fillOpacity={isSpotlight ? '0.18' : '0.08'} stroke="currentColor" strokeWidth="1.2" />
            <circle cx="0" cy="0" r="18" stroke="currentColor" strokeWidth="1" />
            <path d={rays} fill="currentColor" fillOpacity={isSpotlight ? '0.1' : '0.04'} stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            <circle cx="0" cy="0" r="52" stroke="currentColor" strokeWidth="1.15" />
            <circle cx="0" cy="0" r="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="0" cy="0" r="76" stroke="currentColor" strokeWidth="1.15" />
            <circle cx="0" cy="0" r="96" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="0" cy="0" r="116" stroke="currentColor" strokeWidth="1.15" />
            <circle cx="0" cy="0" r="138" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 6" />
          </g>
        ))}
      </svg>
    </svg>
  )
}

function LotusPatternLayer({ idPrefix, isSpotlight }: { idPrefix: string; isSpotlight?: boolean }) {
  // Architectural Overlapping-Circle Petal Lattice (Shippo / Vesica Piscis lotus petal geometry)
  const patId = `${idPrefix}-lotus-lattice-${isSpotlight ? 'spot' : 'base'}`

  return (
    <svg width="100%" height="100%" className="h-full w-full" shapeRendering="geometricPrecision" focusable="false">
      <defs>
        <pattern id={patId} width="44" height="44" patternUnits="userSpaceOnUse">
          {/* Geometric overlapping circles forming 4 pure minimalist lotus petals per cell */}
          <circle cx="22" cy="22" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="44" cy="0" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="0" cy="44" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="44" cy="44" r="22" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Tiny intersection diamond dot */}
          <circle cx="22" cy="22" r="1.5" fill="currentColor" fillOpacity={isSpotlight ? '0.6' : '0.3'} />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patId})`} />

      {/* Subtle highlighted petal cells for depth */}
      <svg x="0" y="0" className="overflow-visible">
        {(
          [
            [1, 0],
            [4, 1],
            [7, 0],
            [10, 2],
            [2, 3],
            [8, 3],
            [13, 1],
            [16, 2],
          ] as const
        ).map(([gx, gy]) => (
          <circle
            key={`${gx}-${gy}`}
            cx={gx * 44 + 22}
            cy={gy * 44 + 22}
            r="14"
            fill="currentColor"
            fillOpacity={isSpotlight ? '0.14' : '0.05'}
          />
        ))}
      </svg>
    </svg>
  )
}

function RouteRibbonPatternLayer({ idPrefix, isSpotlight }: { idPrefix: string; isSpotlight?: boolean }) {
  // Linear / Flighty / Magic UI DotPattern + Precision Telemetry Route Meridians
  const dotId = `${idPrefix}-route-dots-${isSpotlight ? 'spot' : 'base'}`

  return (
    <svg width="100%" height="100%" className="h-full w-full" shapeRendering="geometricPrecision" focusable="false">
      <defs>
        <pattern id={dotId} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r={isSpotlight ? '1.35' : '1.15'} fill="currentColor" fillOpacity={isSpotlight ? '0.75' : '0.45'} />
        </pattern>
      </defs>

      {/* Full-card precision dot matrix */}
      <rect width="100%" height="100%" fill={`url(#${dotId})`} />

      {/* Telemetry geodesic route arcs & coordinate crosshairs across the full card */}
      <svg viewBox="0 0 800 260" preserveAspectRatio="xMidYMid slice" className="h-full w-full" fill="none">
        {/* Geodesic flight/route curves spanning left-to-right */}
        <path
          d="M -20 220 C 160 220, 240 64, 460 76 C 640 86, 710 184, 820 148"
          stroke="currentColor"
          strokeWidth={isSpotlight ? '1.6' : '1.2'}
        />
        <path
          d="M -20 236 C 168 236, 248 80, 468 92 C 648 102, 716 200, 820 164"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeDasharray="5 5"
        />
        <path
          d="M 60 -10 C 200 110, 440 160, 780 44"
          stroke="currentColor"
          strokeWidth="0.95"
          strokeDasharray="3 6"
        />

        {/* Precision radar/waypoint nodes along the geodesic curve */}
        {[
          { x: 142, y: 174 },
          { x: 356, y: 86 },
          { x: 582, y: 118 },
          { x: 724, y: 162 },
        ].map(({ x, y }, i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle cx="0" cy="0" r="12" stroke="currentColor" strokeWidth="0.9" strokeDasharray="2 3" />
            <circle
              cx="0"
              cy="0"
              r="5"
              fill="currentColor"
              fillOpacity={isSpotlight ? '0.25' : '0.1'}
              stroke="currentColor"
              strokeWidth="1.25"
            />
            <circle cx="0" cy="0" r="2" fill="currentColor" />
          </g>
        ))}

        {/* Architectural registration crosshairs (+) */}
        {(
          [
            [88, 44],
            [264, 198],
            [484, 44],
            [660, 220],
          ] as const
        ).map(([cx, cy], idx) => (
          <path
            key={idx}
            d={`M ${cx - 5} ${cy} H ${cx + 5} M ${cx} ${cy - 5} V ${cy + 5}`}
            stroke="currentColor"
            strokeWidth="1.1"
          />
        ))}
      </svg>
    </svg>
  )
}

function HeritageLatticePatternLayer({ idPrefix, isSpotlight }: { idPrefix: string; isSpotlight?: boolean }) {
  // Tailwind UI / Magic UI Diagonal Architectural Hatch + Highlighted Bento Cells
  const patId = `${idPrefix}-heritage-grid-${isSpotlight ? 'spot' : 'base'}`

  return (
    <svg width="100%" height="100%" className="h-full w-full" shapeRendering="geometricPrecision" focusable="false">
      <defs>
        <pattern id={patId} width="32" height="32" patternUnits="userSpaceOnUse">
          {/* Outer grid cell */}
          <path d="M 0 32 V 0 H 32" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Fine inner diagonal diamond thread */}
          <path d="M 16 0 L 32 16 L 16 32 L 0 16 Z" fill="none" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.65" />
          {/* Intersection micro-cross */}
          <circle cx="16" cy="16" r="1.2" fill="currentColor" fillOpacity={isSpotlight ? '0.6' : '0.3'} />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patId})`} />

      {/* Highlighted diamond/square bento cells */}
      <svg x="0" y="0" className="overflow-visible">
        {(
          [
            [1, 1],
            [4, 0],
            [7, 2],
            [2, 4],
            [5, 3],
            [8, 5],
            [0, 7],
            [6, 8],
            [3, 11],
            [7, 13],
          ] as const
        ).map(([gx, gy]) => (
          <rect
            key={`${gx}-${gy}`}
            x={gx * 32 + 1}
            y={gy * 32 + 1}
            width="31"
            height="31"
            fill="currentColor"
            fillOpacity={isSpotlight ? '0.15' : '0.055'}
          />
        ))}
      </svg>
    </svg>
  )
}

function renderPattern(variant: WatermarkVariant, idPrefix: string, isSpotlight?: boolean) {
  switch (variant) {
    case 'dong-son':
      return <DongSonPatternLayer idPrefix={idPrefix} isSpotlight={isSpotlight} />
    case 'lotus':
      return <LotusPatternLayer idPrefix={idPrefix} isSpotlight={isSpotlight} />
    case 'route-ribbon':
      return <RouteRibbonPatternLayer idPrefix={idPrefix} isSpotlight={isSpotlight} />
    case 'heritage-lattice':
      return <HeritageLatticePatternLayer idPrefix={idPrefix} isSpotlight={isSpotlight} />
  }
}

export function CardWatermark({ variant, className = '' }: CardWatermarkProps) {
  const rawId = useId()
  const idPrefix = `vxv-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const rootRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el) return

    // Walk up to the nearest interactive card container (skipping pointer-events-none wrappers)
    let card: HTMLElement | null = el.parentElement
    while (card && card !== document.body && window.getComputedStyle(card).pointerEvents === 'none') {
      card = card.parentElement
    }
    if (!card) return

    const handlePointerMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.setProperty('--spot-x', `${x.toFixed(0)}px`)
      el.style.setProperty('--spot-y', `${y.toFixed(0)}px`)
    }

    card.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      card?.removeEventListener('pointermove', handlePointerMove)
    }
  }, [])

  return (
    <span
      ref={rootRef}
      aria-hidden="true"
      className={[
        'pointer-events-none select-none absolute inset-0 z-0 h-full w-full overflow-hidden rounded-[inherit]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Layer 1: Base subtle architectural pattern spanning the full card frame with soft center fade */}
      <span
        className={[
          'absolute inset-0 h-full w-full text-orange-950/[0.065] dark:text-orange-200/[0.07]',
          'transition-opacity duration-300 group-hover:opacity-90',
          '[mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,0.35)_15%,rgba(0,0,0,0.95)_85%)]',
        ].join(' ')}
      >
        {renderPattern(variant, idPrefix, false)}
      </span>

      {/* Layer 2: Ambient warm-orange perimeter illumination on card hover */}
      <span
        className={[
          'absolute inset-0 h-full w-full text-[#f97316]/[0.18]',
          'opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100',
          '[mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_92%)]',
        ].join(' ')}
      >
        {renderPattern(variant, idPrefix, true)}
      </span>

      {/* Layer 3: Cursor-tracking Spotlight Reveal (Aceternity / MagicCard style) */}
      <span
        className={[
          'absolute inset-0 h-full w-full text-[#f97316]/[0.42]',
          'opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100',
        ].join(' ')}
        style={{
          background:
            'radial-gradient(300px circle at var(--spot-x, 80%) var(--spot-y, 30%), rgba(251, 146, 60, 0.10), transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(260px circle at var(--spot-x, 80%) var(--spot-y, 30%), black 0%, transparent 100%)',
          maskImage:
            'radial-gradient(260px circle at var(--spot-x, 80%) var(--spot-y, 30%), black 0%, transparent 100%)',
        }}
      >
        {renderPattern(variant, idPrefix, true)}
      </span>
    </span>
  )
}
