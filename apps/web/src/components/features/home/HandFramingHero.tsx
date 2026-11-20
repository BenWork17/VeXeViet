'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion'
import { Pause, Play } from 'lucide-react'

/**
 * First-Person Human POV "Director's Hand-Frame" Video Hero Stage
 *
 * - 0ms LCP Poster (`hero-vietnam-bus.jpg`) cross-fades cleanly into a seamless
 *   1080p 2D Ligne-Claire looping `<video>` (`WebM VP9` + `MP4 H.264`).
 * - Diagonal Counter-Balanced Viewfinder HUD sits at Top-Left (`┌`) and Bottom-Right (`┘`),
 *   100% unobstructed by the 2D hands at Bottom-Left (`└`) and Top-Right (`┐`).
 * - Auto-pauses via `IntersectionObserver` when scrolled offscreen; honors `prefers-reduced-motion`.
 * - Frame styling uses Aceternity `ContainerScroll` / Double-Bezel 3D Camera Housing.
 */
export function HandFramingHero() {
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const [isVideoReady, setIsVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)
  const [isUserPaused, setIsUserPaused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // Track scroll progress across the hero stage
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start start', 'end start'],
  })

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 105,
    damping: 24,
    mass: 0.45,
  })

  // Bottom-Left Arm (└): lowers down & pulls left off-screen as user scrolls down
  const bottomLeftY = useTransform(smoothScroll, [0, 0.52], [0, 320])
  const bottomLeftX = useTransform(smoothScroll, [0, 0.52], [0, -120])
  const bottomLeftRotate = useTransform(smoothScroll, [0, 0.52], [1.5, -15])

  // Top-Right Arm (┐): lowers down & pulls right off-screen as user scrolls down
  const topRightY = useTransform(smoothScroll, [0, 0.52], [0, 380])
  const topRightX = useTransform(smoothScroll, [0, 0.52], [0, 130])
  const topRightRotate = useTransform(smoothScroll, [0, 0.52], [-4, 16])

  const handsOpacity = useTransform(smoothScroll, [0, 0.38, 0.54], [1, 0.7, 0])
  const hudOpacity = useTransform(smoothScroll, [0, 0.34], [1, 0])

  // Aceternity ContainerScroll-style 3D perspective tilt & scale expansion as hands lower
  const frameScale = useTransform(smoothScroll, [0, 0.48], [0.965, 1])
  const frameRotateX = useTransform(smoothScroll, [0, 0.48], [3.5, 0])
  const imageInnerScale = useTransform(smoothScroll, [0, 0.58], [1.035, 1])

  // Subtle first-person binocular gaze parallax on mouse movement
  const gazeX = useMotionValue(0)
  const gazeY = useMotionValue(0)
  const smoothGazeX = useSpring(gazeX, { stiffness: 120, damping: 22 })
  const smoothGazeY = useSpring(gazeY, { stiffness: 120, damping: 22 })

  const handParallaxX = useTransform(smoothGazeX, [-0.5, 0.5], [-10, 10])
  const handParallaxY = useTransform(smoothGazeY, [-0.5, 0.5], [-7, 7])
  const imageParallaxX = useTransform(smoothGazeX, [-0.5, 0.5], [7, -7])
  const imageParallaxY = useTransform(smoothGazeY, [-0.5, 0.5], [5, -5])

  // Explicitly enforce muted + trigger autoplay on mount (fixes React 18 muted/hydration race)
  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl || videoFailed) return

    videoEl.muted = true
    videoEl.defaultMuted = true

    if (videoEl.readyState >= 2) {
      setIsVideoReady(true)
    }

    if (!isUserPaused) {
      videoEl
        .play()
        .then(() => {
          setIsVideoReady(true)
          setIsPlaying(true)
        })
        .catch(() => {
          // Browser autoplay policy blocked; user can still click Play button
        })
    }
  }, [isUserPaused, videoFailed])

  // Pause video automatically when hero scrolls out of viewport to save GPU/battery
  useEffect(() => {
    const stageEl = stageRef.current
    const videoEl = videoRef.current
    if (!stageEl || !videoEl || videoFailed) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting && !isUserPaused) {
          videoEl.muted = true
          videoEl.play().catch(() => {})
        } else if (!entry.isIntersecting) {
          videoEl.pause()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(stageEl)
    return () => observer.disconnect()
  }, [isUserPaused, videoFailed])

  const handleTogglePlay = useCallback(() => {
    const videoEl = videoRef.current
    if (!videoEl || videoFailed) return
    if (videoEl.paused) {
      setIsUserPaused(false)
      videoEl.play().catch(() => {})
    } else {
      setIsUserPaused(true)
      videoEl.pause()
    }
  }, [videoFailed])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    gazeX.set(nx)
    gazeY.set(ny)
  }

  const handlePointerLeave = () => {
    gazeX.set(0)
    gazeY.set(0)
  }

  const showVideo = (isVideoReady || isPlaying) && !videoFailed

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative my-2 w-full select-none [perspective:1400px] lg:my-4"
    >
      {/* Shared 3D coordinate space so Hands & Frame Corners never drift apart */}
      <motion.div
        style={
          prefersReducedMotion
            ? undefined
            : {
                scale: frameScale,
                rotateX: frameRotateX,
                transformStyle: 'preserve-3d',
              }
        }
        className="relative w-full"
      >
        {/* Double-Bezel 3D Camera Housing */}
        <div
          className={[
            'relative z-10 w-full rounded-[24px] bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 p-[6px] sm:p-[8px]',
            'ring-1 ring-neutral-950/90',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_2px_4px_rgba(15,23,42,0.18),0_10px_20px_rgba(15,23,42,0.16),0_28px_44px_-8px_rgba(15,23,42,0.22),0_56px_72px_-16px_rgba(15,23,42,0.14)]',
          ].join(' ')}
        >
          {/* Recessed 3D Dark Seam / Gap inside the Camera Bezel */}
          <div className="relative overflow-hidden rounded-[18px] bg-neutral-950 p-[2.5px] shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] ring-1 ring-white/[0.07]">
            {/* Inner Picture / Video Plane */}
            <div className="relative h-[240px] w-full overflow-hidden rounded-[15.5px] bg-white sm:h-[340px] md:h-[420px] lg:h-[480px] xl:h-[530px] 2xl:h-[560px]">
              <motion.div
                style={
                  prefersReducedMotion
                    ? undefined
                    : {
                        scale: imageInnerScale,
                        x: imageParallaxX,
                        y: imageParallaxY,
                      }
                }
                className="relative h-full w-full will-change-transform [backface-visibility:hidden]"
              >
                {/* Layer 2: Photorealistic 1080p 30fps Cinematic Vietnam Bus TVC Loop */}
                {!videoFailed && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster="/images/hero-tvc-poster.jpg"
                    onLoadedData={() => setIsVideoReady(true)}
                    onCanPlay={() => setIsVideoReady(true)}
                    onPlaying={() => {
                      setIsVideoReady(true)
                      setIsPlaying(true)
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => setVideoFailed(true)}
                    className="absolute inset-0 z-0 h-full w-full object-cover object-center"
                  >
                    <source src="/videos/hero-vietnam-tvc.mp4" type="video/mp4" />
                    <source src="/videos/hero-vietnam-tvc.webm" type="video/webm" />
                  </video>
                )}

                {/* Layer 1: 0ms LCP Poster Image (fades smoothly once video is ready) */}
                <Image
                  src="/images/hero-tvc-poster.jpg"
                  alt="Xe khách VeXeViet lăn bánh qua Đèo Hải Vân, Phố cổ Hội An và Đà Lạt"
                  fill
                  priority
                  sizes="(max-width: 1520px) 100vw, 1520px"
                  className={[
                    'z-10 object-cover object-center transition-opacity duration-700 ease-out',
                    showVideo ? 'pointer-events-none opacity-0' : 'opacity-100',
                  ].join(' ')}
                />
              </motion.div>

              {/* Diagonal Counter-Balanced Camera Viewfinder HUD (Top-Left ┌ & Bottom-Right ┘) */}
              <motion.div
                style={prefersReducedMotion ? undefined : { opacity: hudOpacity }}
                className="pointer-events-none absolute inset-0 z-20"
              >
                {/* Delicate optical viewfinder corner hairlines */}
                <span
                  aria-hidden="true"
                  className="absolute top-3 left-3 h-4 w-4 rounded-tl border-t-[1.5px] border-l-[1.5px] border-neutral-900/35"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-3 bottom-3 h-4 w-4 rounded-br border-r-[1.5px] border-b-[1.5px] border-neutral-900/35"
                />

                {/* Top-Left HUD Cluster: Live Indicator + Play/Pause Control */}
                <div
                  onPointerMove={(e) => e.stopPropagation()}
                  className="pointer-events-auto absolute top-4 left-4 flex items-center gap-2 sm:top-5 sm:left-5"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-neutral-950/75 px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wider text-white shadow-md backdrop-blur-md">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                      {isPlaying && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      )}
                      <span
                        className={[
                          'relative inline-flex h-2 w-2 rounded-full',
                          isPlaying ? 'bg-primary' : 'bg-neutral-400',
                        ].join(' ')}
                      />
                    </span>
                    <span>REC • 24FPS • XUYÊN VIỆT</span>
                  </div>

                  {!videoFailed && isVideoReady && (
                    <button
                      type="button"
                      onClick={handleTogglePlay}
                      aria-label={isPlaying ? 'Tạm dừng video hành trình' : 'Phát video hành trình'}
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-neutral-950/75 text-white shadow-md backdrop-blur-md transition-colors hover:border-primary hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {isPlaying ? <Pause size={13} aria-hidden="true" /> : <Play size={13} className="translate-x-[0.5px]" aria-hidden="true" />}
                    </button>
                  )}
                </div>

                {/* Bottom-Right Subtle Scenic Route Badge */}
                <div className="absolute right-4 bottom-4 hidden items-center gap-2 rounded-full border border-white/15 bg-neutral-950/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-white/95 shadow-md backdrop-blur-md sm:inline-flex sm:right-5 sm:bottom-5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <span>Đèo Hải Vân • Phố cổ Hội An • Đà Lạt</span>
                </div>
              </motion.div>

              {/* Crisp 1px inner glass rim highlight */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 rounded-[15.5px] ring-1 ring-inset ring-black/15"
              />
            </div>
          </div>
        </div>

        {/* 3D Recessed Bottom Ledge (Physical Depth Plate underneath the Camera Frame) */}
        <div
          aria-hidden="true"
          className="pointer-events-none mx-5 -mt-2 h-3.5 rounded-b-[20px] border-x border-b border-neutral-900/40 bg-gradient-to-b from-neutral-950/85 to-neutral-900/45 shadow-[0_12px_24px_-4px_rgba(15,23,42,0.22)] sm:mx-8"
        />

        {/*
          First-Person 2D-Illustrated Hands & Forearms Overlay (Top-Right ┐ & Bottom-Left └)
          Locked inside the same coordinate box as the frame so corners align at 24-inch 1920x1080.
        */}
        <motion.div
          aria-hidden="true"
          style={
            prefersReducedMotion
              ? undefined
              : {
                  opacity: handsOpacity,
                  x: handParallaxX,
                  y: handParallaxY,
                }
          }
          className="pointer-events-none absolute inset-0 z-30 overflow-visible"
        >
          {/* BOTTOM-LEFT HAND & FOREARM (└ gesture) */}
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : {
                    x: bottomLeftX,
                    y: bottomLeftY,
                    rotate: bottomLeftRotate,
                  }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                  }
            }
            transition={{
              duration: 4.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-0 left-0 h-[250px] w-[250px] -translate-x-[63.5%] translate-y-[44%] origin-bottom-left sm:h-[340px] sm:w-[340px] lg:h-[440px] lg:w-[440px] xl:h-[490px] xl:w-[490px]"
          >
            <Image
              src="/images/pov-hand-bottom-left.png?v=2d"
              alt=""
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 340px, 490px"
              className="object-contain drop-shadow-[6px_10px_14px_rgba(15,10,6,0.28)]"
            />
          </motion.div>

          {/* TOP-RIGHT HAND & FOREARM (┐ gesture) */}
          <motion.div
            style={
              prefersReducedMotion
                ? undefined
                : {
                    x: topRightX,
                    y: topRightY,
                    rotate: topRightRotate,
                  }
            }
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    y: [0, -4, 0],
                  }
            }
            transition={{
              duration: 4.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.35,
            }}
            className="absolute top-0 right-0 h-[250px] w-[250px] translate-x-[54.5%] -translate-y-[54%] origin-top-right sm:h-[340px] sm:w-[340px] lg:h-[440px] lg:w-[440px] xl:h-[490px] xl:w-[490px]"
          >
            <Image
              src="/images/pov-hand-top-right.png?v=2d"
              alt=""
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 340px, 490px"
              className="object-contain drop-shadow-[-6px_12px_16px_rgba(15,10,6,0.28)]"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
