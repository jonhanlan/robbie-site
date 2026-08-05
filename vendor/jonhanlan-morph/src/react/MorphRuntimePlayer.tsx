'use client'

import { type KeyboardEvent, type MouseEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  createDrawableRenderCache,
  isMorphRuntimeDocumentV0,
  renderMorphRuntimeDocumentV0,
  type DrawableRenderCache,
  type MorphRuntimeDocumentV0,
} from '../runtime'
import {
  morphRuntimePlayerInitialProgressV0,
  morphRuntimePlayerInteractiveEnabledV0,
  morphRuntimePlayerShouldAnimateV0,
  resolveMorphRuntimePlayerContractV0,
} from './runtime-player-contract'
import {
  MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS,
  MORPH_RUNTIME_PLAYER_DEFAULT_EASING,
  clampProgress,
  morphRuntimePlayerTargetStateV0,
  morphRuntimePlayerTimingV0,
  nonNegative,
} from './runtime-player-state'

export type MorphRuntimePlayerProps = {
  document: unknown
  className?: string
  fromState?: string | null
  state?: string
  title?: string
  interactive?: boolean
  progress?: number
}

type RuntimePhase = 'rest' | 'enter' | 'return-wait' | 'return' | 'settled'
const PROGRESS_EPSILON = 0.0001

function easeProgress(progress: number, easing: string): number {
  const t = clampProgress(progress)
  if (easing === 'linear') return t
  if (easing === 'ease-in') return t * t
  if (easing === 'ease-out') return 1 - (1 - t) * (1 - t)
  if (easing === 'ease-in-out' || easing === 'smoothstep') return t * t * (3 - 2 * t)
  if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - 2 ** (-10 * t)
  return t
}

function renderRuntimeMarkup(
  document: MorphRuntimeDocumentV0,
  fromState: string | null,
  state: string | null,
  progress: number,
  frame: number,
  cache?: DrawableRenderCache,
) {
  return renderMorphRuntimeDocumentV0(document, {
    f: fromState ?? undefined,
    state: state ?? undefined,
    progress,
    frame,
    cache,
  })
}

export function MorphRuntimePlayer({
  document,
  className,
  fromState,
  state,
  title,
  interactive = true,
  progress,
}: MorphRuntimePlayerProps) {
  const runtimeDocument = isMorphRuntimeDocumentV0(document) ? document : null
  const initialProgress = clampProgress(progress)
  const contractStatus = useMemo(
    () => (runtimeDocument ? resolveMorphRuntimePlayerContractV0(runtimeDocument) : null),
    [runtimeDocument],
  )
  const targetState = useMemo(
    () => (runtimeDocument ? morphRuntimePlayerTargetStateV0(runtimeDocument.scene, state) : null),
    [runtimeDocument, state],
  )
  const sourceState = useMemo(
    () => {
      if (!runtimeDocument || !fromState || fromState === runtimeDocument.scene.entry) return null
      return morphRuntimePlayerTargetStateV0(runtimeDocument.scene, fromState)
    },
    [fromState, runtimeDocument],
  )
  const timing = useMemo(
    () => (runtimeDocument ? morphRuntimePlayerTimingV0(runtimeDocument.scene) : null),
    [runtimeDocument],
  )
  const renderCacheRef = useRef(createDrawableRenderCache())
  const initialMarkup = useMemo(
    () => (runtimeDocument ? renderRuntimeMarkup(
      runtimeDocument,
      sourceState,
      targetState,
      initialProgress,
      0,
      renderCacheRef.current,
    ) : ''),
    [runtimeDocument, sourceState, targetState, initialProgress],
  )
  const svgRef = useRef<SVGSVGElement | null>(null)
  const progressRef = useRef(initialProgress)
  const frameRef = useRef(0)
  const lastRenderAtRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const returnTimerRef = useRef<number | null>(null)
  const reduceMotionRef = useRef(false)
  const phaseRef = useRef<RuntimePhase>(initialProgress > 0 ? 'settled' : 'rest')
  const animationRef = useRef({
    from: initialProgress,
    to: initialProgress,
    startedAt: 0,
    durationMs: 0,
    easing: MORPH_RUNTIME_PLAYER_DEFAULT_EASING,
    phase: phaseRef.current,
  })

  const renderFrame = useCallback((progress: number, phase: RuntimePhase = phaseRef.current, renderedAt = performance.now()) => {
    if (!runtimeDocument || !svgRef.current) return
    frameRef.current += 1
    lastRenderAtRef.current = renderedAt
    phaseRef.current = phase
    svgRef.current.innerHTML = renderRuntimeMarkup(runtimeDocument, sourceState, targetState, progress, frameRef.current, renderCacheRef.current)
  }, [runtimeDocument, sourceState, targetState])

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const clearReturnTimer = useCallback(() => {
    if (returnTimerRef.current != null) window.clearTimeout(returnTimerRef.current)
    returnTimerRef.current = null
  }, [])

  const setPhase = useCallback((phase: RuntimePhase) => {
    phaseRef.current = phase
  }, [])

  const tick = useCallback((now: number) => {
    const animation = animationRef.current
    const rawProgress = animation.durationMs <= 0
      ? 1
      : clampProgress((now - animation.startedAt) / animation.durationMs)
    const easedProgress = easeProgress(rawProgress, animation.easing)
    const next = animation.from + (animation.to - animation.from) * easedProgress

    if (rawProgress >= 1) {
      progressRef.current = animation.to
      rafRef.current = null
      renderFrame(animation.to, 'settled', now)
      return
    }
    progressRef.current = next
    if (now - lastRenderAtRef.current >= (timing?.renderIntervalMs ?? 0)) {
      renderFrame(next, animation.phase, now)
    }
    rafRef.current = window.requestAnimationFrame(tick)
  }, [renderFrame, timing?.renderIntervalMs])

  const animateTo = useCallback((target: number, durationMs: number, phase: RuntimePhase) => {
    if (!timing) return
    const nextTarget = clampProgress(target)
    const activeAnimation = animationRef.current
    if (
      activeAnimation.to === nextTarget &&
      activeAnimation.phase === phase &&
      phaseRef.current === phase
    ) {
      return
    }
    if (Math.abs(progressRef.current - nextTarget) <= PROGRESS_EPSILON && phaseRef.current === 'settled') return
    if (timing.interrupt === 'ignore' && rafRef.current != null) return
    stopAnimation()

    if (runtimeDocument && !morphRuntimePlayerShouldAnimateV0(runtimeDocument, reduceMotionRef.current)) {
      progressRef.current = nextTarget
      renderFrame(nextTarget, 'settled')
      return
    }

    const nextDuration = nonNegative(durationMs, MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS)
    if (nextDuration <= 0) {
      progressRef.current = nextTarget
      renderFrame(nextTarget, 'settled')
      return
    }

    const startedAt = performance.now()
    animationRef.current = {
      from: progressRef.current,
      to: nextTarget,
      startedAt,
      durationMs: nextDuration,
      easing: timing.easing,
      phase,
    }
    renderFrame(progressRef.current, phase, startedAt)
    rafRef.current = window.requestAnimationFrame(tick)
  }, [renderFrame, runtimeDocument, stopAnimation, tick, timing])

  const scheduleReturn = useCallback((delayMs: number) => {
    if (!timing) return
    clearReturnTimer()
    const runReturn = () => {
      returnTimerRef.current = null
      animateTo(initialProgress, timing.returnDurationMs, 'return')
    }
    const waitMs = nonNegative(delayMs, timing.returnDelayMs)
    if (waitMs <= 0 || reduceMotionRef.current) {
      runReturn()
      return
    }
    setPhase('return-wait')
    returnTimerRef.current = window.setTimeout(runReturn, waitMs)
  }, [animateTo, clearReturnTimer, initialProgress, setPhase, timing])

  const handleEnter = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    clearReturnTimer()
    animateTo(1, timing.enterDurationMs, 'enter')
  }, [animateTo, clearReturnTimer, interactive, runtimeDocument, timing])

  const handleReturn = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    scheduleReturn(timing.returnDelayMs)
  }, [interactive, runtimeDocument, scheduleReturn, timing])

  const handleActivate = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    clearReturnTimer()
    animateTo(1, timing.enterDurationMs, 'enter')
    if (timing.holdMs > 0) scheduleReturn(timing.enterDurationMs + timing.holdMs + timing.returnDelayMs)
  }, [animateTo, clearReturnTimer, interactive, runtimeDocument, scheduleReturn, timing])

  const handleKeyDown = useCallback((event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleActivate()
  }, [handleActivate])

  const handleMouseDown = useCallback((event: MouseEvent<SVGSVGElement>) => {
    event.preventDefault()
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reduceMotionRef.current = reducedMotion
    clearReturnTimer()
    stopAnimation()
    const resetProgress = runtimeDocument ? morphRuntimePlayerInitialProgressV0(runtimeDocument, initialProgress, reducedMotion) : initialProgress
    progressRef.current = resetProgress
    frameRef.current = 0
    lastRenderAtRef.current = 0
    animationRef.current = {
      from: resetProgress,
      to: resetProgress,
      startedAt: 0,
      durationMs: 0,
      easing: timing?.easing ?? MORPH_RUNTIME_PLAYER_DEFAULT_EASING,
      phase: resetProgress > 0 ? 'settled' : 'rest',
    }
    renderFrame(resetProgress, resetProgress > 0 ? 'settled' : 'rest')
    return () => {
      clearReturnTimer()
      stopAnimation()
    }
  }, [clearReturnTimer, initialProgress, renderFrame, runtimeDocument, stopAnimation, timing?.easing])

  if (!runtimeDocument) return null

  const [width, height] = runtimeDocument.scene.viewBox
  const sceneTitle = runtimeDocument.scene.meta?.title
  const label = title?.trim() || (typeof sceneTitle === 'string' && sceneTitle.trim()) || runtimeDocument.scene.id
  const effectiveInteractive = interactive && (contractStatus?.supported ?? false)

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role={effectiveInteractive ? 'button' : 'img'}
      aria-label={label}
      tabIndex={effectiveInteractive ? 0 : undefined}
      data-morph-runtime-player
      preserveAspectRatio="xMidYMid meet"
      onPointerEnter={effectiveInteractive ? handleEnter : undefined}
      onPointerLeave={effectiveInteractive ? handleReturn : undefined}
      onFocus={effectiveInteractive ? handleEnter : undefined}
      onBlur={effectiveInteractive ? handleReturn : undefined}
      onMouseDown={effectiveInteractive ? handleMouseDown : undefined}
      onClick={effectiveInteractive ? handleActivate : undefined}
      onKeyDown={effectiveInteractive ? handleKeyDown : undefined}
      dangerouslySetInnerHTML={{ __html: initialMarkup }}
    />
  )
}
