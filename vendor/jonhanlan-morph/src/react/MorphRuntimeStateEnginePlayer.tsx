'use client'

import { type KeyboardEvent, type MouseEvent, type PointerEvent, useCallback, useEffect, useMemo, useRef } from 'react'
import {
  createDrawableRenderCache,
  isMorphRuntimeDocumentV0,
  morphRuntimeFieldCacheStatusV0,
  type DrawableRenderCache,
  type MorphRuntimeDocumentV0,
} from '../runtime'
import { renderMorphRuntimeDocumentWithOverlaysV0 } from '../drawable/render-overlays'
import {
  morphRuntimePlayerInitialProgressV0,
  morphRuntimePlayerInteractiveEnabledV0,
  morphRuntimePlayerShouldAnimateV0,
  resolveMorphRuntimePlayerContractV0,
} from './runtime-player-contract'
import {
  createMorphRuntimePlayerStateEngineV0,
  clampProgress,
  MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS,
  morphRuntimePlayerEaseProgressV0,
  morphRuntimePlayerOverlayTransitionForTriggerV0,
  morphRuntimePlayerRenderStateForControllerValuesV0,
  morphRuntimePlayerRestRenderStateV0,
  morphRuntimePlayerRenderStateForSnapshotV0,
  morphRuntimePlayerTargetStateV0,
  morphRuntimePlayerTimingV0,
  morphRuntimePlayerUsesAdditiveOverlaysV0,
  nonNegative,
  type MorphRuntimePlayerControllerValuesV0,
  type MorphRuntimePlayerOverlayStateV0,
  type MorphRuntimePlayerRenderStateV0,
} from './runtime-player-state'

export type MorphRuntimeStateEnginePlayerProps = {
  document: unknown
  className?: string
  state?: string
  title?: string
  interactive?: boolean
  progress?: number
  controllerValues?: MorphRuntimePlayerControllerValuesV0
  triggerSignal?: MorphRuntimePlayerTriggerSignalV0 | null
}

export type MorphRuntimePlayerTriggerSignalV0 = {
  trigger: string
  signal: string | number
  pointerInside?: boolean
  scrollPx?: number
}

type MorphRuntimePlayerStateEngineV0 = ReturnType<typeof createMorphRuntimePlayerStateEngineV0>
type MorphRuntimePlayerStateEngineSnapshotV0 = ReturnType<MorphRuntimePlayerStateEngineV0['snapshot']>
type MorphRuntimePlayerOverlayChannelV0 = MorphRuntimePlayerOverlayStateV0 & {
  fromProgress: number
  targetProgress: number
  startedAt: number
  durationMs: number
  easing: string
}

function renderRuntimeMarkup(
  document: MorphRuntimeDocumentV0,
  fromState: string | null | undefined,
  state: string | null,
  progress: number,
  frame: number,
  cache?: DrawableRenderCache,
  overlays?: MorphRuntimePlayerOverlayStateV0[],
) {
  return renderMorphRuntimeDocumentWithOverlaysV0(document, {
    f: fromState,
    state: state ?? undefined,
    progress,
    frame,
    cache,
    overlays,
  })
}

function sceneLabel(document: MorphRuntimeDocumentV0, fallback?: string) {
  const title = document.scene.meta?.title
  return fallback?.trim() || (typeof title === 'string' && title.trim()) || document.scene.id
}

function applyFieldCacheDataset(
  svg: SVGSVGElement,
  document: MorphRuntimeDocumentV0,
  renderState: MorphRuntimePlayerRenderStateV0,
) {
  const live = renderState.fromState || renderState.overlays?.some((overlay) => overlay.progress > 0)
  const status = morphRuntimeFieldCacheStatusV0(document, {
    state: renderState.state,
    progress: renderState.progress,
  })
  svg.dataset.morphRuntimeFieldCachePolicy = status.policy
  svg.dataset.morphRuntimeFieldCacheSource = live ? 'live-fallback' : status.source
  svg.dataset.morphRuntimeFieldCacheMatchingLayers = live ? '0' : String(status.matchingLayers)
  svg.dataset.morphRuntimeFieldCacheProgresses = status.cachedProgresses.join(',')
}

function applyControllerDataset(svg: SVGSVGElement, renderState: MorphRuntimePlayerRenderStateV0) {
  if (renderState.controllerId && typeof renderState.controllerValue === 'number') {
    svg.dataset.morphRuntimeController = renderState.controllerId
    svg.dataset.morphRuntimeControllerValue = renderState.controllerValue.toFixed(3)
  } else {
    delete svg.dataset.morphRuntimeController
    delete svg.dataset.morphRuntimeControllerValue
  }

  if (typeof renderState.scrubProgress === 'number' && typeof renderState.scrubEasedProgress === 'number') {
    svg.dataset.morphRuntimeScrollProgress = renderState.scrubProgress.toFixed(3)
    svg.dataset.morphRuntimeScrollEasedProgress = renderState.scrubEasedProgress.toFixed(3)
    svg.dataset.morphRuntimeScrollTrack = renderState.scrubTrack?.join(',') ?? ''
  } else {
    delete svg.dataset.morphRuntimeScrollProgress
    delete svg.dataset.morphRuntimeScrollEasedProgress
    delete svg.dataset.morphRuntimeScrollTrack
  }

  const overlayValue = renderState.overlays
    ?.filter((overlay) => overlay.progress > 0)
    .map((overlay) => `${overlay.trigger}:${overlay.state}:${overlay.progress.toFixed(3)}`)
    .join(',') ?? ''
  if (overlayValue) {
    svg.dataset.morphRuntimeOverlays = overlayValue
  } else {
    delete svg.dataset.morphRuntimeOverlays
  }
}

function initialRenderState(
  scene: MorphRuntimeDocumentV0['scene'] | undefined,
  targetState: string | null,
  initialProgress: number,
): MorphRuntimePlayerRenderStateV0 {
  return initialProgress <= 0 ? morphRuntimePlayerRestRenderStateV0(scene) : {
    fromState: null,
    state: targetState,
    progress: initialProgress,
    phase: 'settled',
  }
}

export function MorphRuntimeStateEnginePlayer({
  document,
  className,
  state,
  title,
  interactive = true,
  progress,
  controllerValues,
  triggerSignal,
}: MorphRuntimeStateEnginePlayerProps) {
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
  const controlledRenderState = useMemo(
    () => (runtimeDocument ? morphRuntimePlayerRenderStateForControllerValuesV0(runtimeDocument.scene, controllerValues) : null),
    [runtimeDocument, controllerValues],
  )
  const usesOverlayComposition = useMemo(
    () => (runtimeDocument ? morphRuntimePlayerUsesAdditiveOverlaysV0(runtimeDocument.scene) : false),
    [runtimeDocument],
  )
  const firstRenderState = controlledRenderState ?? initialRenderState(runtimeDocument?.scene, targetState, initialProgress)
  const timing = useMemo(
    () => (runtimeDocument ? morphRuntimePlayerTimingV0(runtimeDocument.scene) : null),
    [runtimeDocument],
  )
  const renderCacheRef = useRef(createDrawableRenderCache())
  const initialMarkup = useMemo(
    () => (runtimeDocument ? renderRuntimeMarkup(
      runtimeDocument,
      firstRenderState.fromState,
      firstRenderState.state,
      firstRenderState.progress,
      0,
      renderCacheRef.current,
      firstRenderState.overlays,
    ) : ''),
    [runtimeDocument, firstRenderState],
  )
  const svgRef = useRef<SVGSVGElement | null>(null)
  const frameRef = useRef(0)
  const lastRenderAtRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const overlayRafRef = useRef<number | null>(null)
  const returnTimerRef = useRef<number | null>(null)
  const overlayTimerRefs = useRef<Record<string, number>>({})
  const reduceMotionRef = useRef(false)
  const stateEngineRef = useRef<MorphRuntimePlayerStateEngineV0 | null>(null)
  const overlayChannelsRef = useRef<Record<string, MorphRuntimePlayerOverlayChannelV0>>({})
  const overlayBaseRenderStateRef = useRef<MorphRuntimePlayerRenderStateV0 | null>(null)
  const activeTriggerRef = useRef<{ trigger: string; pointerInside: boolean } | null>(null)
  const pointerInsideRef = useRef(false)
  const pointerPressedRef = useRef(false)
  const triggerSignalRef = useRef<string | number | null>(null)

  const renderFrame = useCallback((renderState: MorphRuntimePlayerRenderStateV0, renderedAt = performance.now()) => {
    if (!runtimeDocument || !svgRef.current) return
    lastRenderAtRef.current = renderedAt
    svgRef.current.innerHTML = renderRuntimeMarkup(
      runtimeDocument,
      renderState.fromState,
      renderState.state,
      renderState.progress,
      ++frameRef.current,
      renderCacheRef.current,
      renderState.overlays,
    )
    svgRef.current.dataset.morphRuntimeState = renderState.progress ? renderState.state! : 'rest'
    svgRef.current.dataset.morphRuntimeFromState = renderState.fromState || 'rest'
    svgRef.current.dataset.morphRuntimeProgress = renderState.progress.toFixed(3)
    svgRef.current.dataset.morphRuntimePhase = renderState.phase
    applyFieldCacheDataset(svgRef.current, runtimeDocument, renderState)
    applyControllerDataset(svgRef.current, renderState)
  }, [runtimeDocument])

  const stopAnimation = useCallback(() => {
    if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  const stopOverlayAnimation = useCallback(() => {
    if (overlayRafRef.current != null) window.cancelAnimationFrame(overlayRafRef.current)
    overlayRafRef.current = null
  }, [])

  const clearReturnTimer = useCallback(() => {
    if (returnTimerRef.current != null) window.clearTimeout(returnTimerRef.current)
    returnTimerRef.current = null
  }, [])

  const clearOverlayTimers = useCallback(() => {
    for (const timer of Object.values(overlayTimerRefs.current)) window.clearTimeout(timer)
    overlayTimerRefs.current = {}
  }, [])

  const renderStateWithOverlays = useCallback((baseRenderState: MorphRuntimePlayerRenderStateV0, now = performance.now()): MorphRuntimePlayerRenderStateV0 => {
    const overlays: MorphRuntimePlayerOverlayStateV0[] = []
    for (const [trigger, channel] of Object.entries(overlayChannelsRef.current)) {
      const elapsed = Math.max(0, now - channel.startedAt)
      const linear = channel.durationMs <= 0 || reduceMotionRef.current ? 1 : clampProgress(elapsed / channel.durationMs)
      const eased = morphRuntimePlayerEaseProgressV0(linear, channel.easing)
      const progress = clampProgress(channel.fromProgress + (channel.targetProgress - channel.fromProgress) * eased)
      channel.progress = progress
      if (linear >= 1) {
        channel.progress = channel.targetProgress
        if (channel.targetProgress <= 0) {
          delete overlayChannelsRef.current[trigger]
          continue
        }
        channel.phase = 'settled'
      }
      if (channel.progress > 0) {
        overlays.push({
          trigger: channel.trigger,
          fromState: channel.fromState,
          state: channel.state,
          progress: channel.progress,
          phase: channel.phase,
        })
      }
    }
    return overlays.length ? { ...baseRenderState, overlays } : baseRenderState
  }, [])

  const renderSnapshot = useCallback((snapshot: MorphRuntimePlayerStateEngineSnapshotV0, renderedAt = performance.now()) => {
    if (!runtimeDocument) return
    renderFrame(morphRuntimePlayerRenderStateForSnapshotV0(runtimeDocument.scene, snapshot, state), renderedAt)
  }, [renderFrame, runtimeDocument, state])

  const tick = useCallback((now: number) => {
    const engine = stateEngineRef.current
    if (!engine) return
    const snapshot = engine.tick(now)
    if (snapshot.settled) {
      rafRef.current = null
      activeTriggerRef.current = null
      renderSnapshot(snapshot, now)
      return
    }
    const interval = timing?.renderIntervalMs ?? 0
    if (now - lastRenderAtRef.current >= interval) renderSnapshot(snapshot, now)
    rafRef.current = window.requestAnimationFrame(tick)
  }, [renderSnapshot, timing?.renderIntervalMs])

  const startSnapshot = useCallback((snapshot: MorphRuntimePlayerStateEngineSnapshotV0, now = performance.now()) => {
    if (!runtimeDocument) return
    stopAnimation()
    const shouldAnimate = morphRuntimePlayerShouldAnimateV0(runtimeDocument, reduceMotionRef.current)
    const renderedSnapshot = shouldAnimate || snapshot.settled || !stateEngineRef.current
      ? snapshot
      : stateEngineRef.current.tick(now + snapshot.durationMs + 1)
    renderSnapshot(renderedSnapshot, now)
    if (shouldAnimate && !renderedSnapshot.settled) rafRef.current = window.requestAnimationFrame(tick)
  }, [renderSnapshot, runtimeDocument, stopAnimation, tick])

  const sendTrigger = useCallback((trigger: string, pointerInside: boolean) => {
    if (!timing || !stateEngineRef.current) return
    const activeTrigger = activeTriggerRef.current
    if (activeTrigger?.trigger === trigger && activeTrigger.pointerInside === pointerInside) return
    if (timing.interrupt === 'ignore' && rafRef.current != null) return
    const now = performance.now()
    activeTriggerRef.current = { trigger, pointerInside }
    startSnapshot(stateEngineRef.current.send({ trigger, now, pointerInside }), now)
  }, [startSnapshot, timing])

  const sendHostTrigger = useCallback((signal: MorphRuntimePlayerTriggerSignalV0) => {
    if (!timing || controlledRenderState || !stateEngineRef.current) return
    const now = performance.now()
    activeTriggerRef.current = {
      trigger: signal.trigger,
      pointerInside: signal.pointerInside ?? false,
    }
    startSnapshot(stateEngineRef.current.send({
      trigger: signal.trigger,
      now,
      pointerInside: signal.pointerInside ?? false,
      scrollPx: signal.scrollPx,
    }), now)
  }, [controlledRenderState, startSnapshot, timing])

  const overlayTick = useCallback((now: number) => {
    const baseRenderState = overlayBaseRenderStateRef.current ?? controlledRenderState ?? firstRenderState
    const renderState = renderStateWithOverlays(baseRenderState, now)
    renderFrame(renderState, now)
    if (Object.keys(overlayChannelsRef.current).length > 0) {
      overlayRafRef.current = window.requestAnimationFrame(overlayTick)
    } else {
      overlayRafRef.current = null
    }
  }, [controlledRenderState, firstRenderState, renderFrame, renderStateWithOverlays])

  const startOverlayAnimation = useCallback(() => {
    if (overlayRafRef.current == null) overlayRafRef.current = window.requestAnimationFrame(overlayTick)
  }, [overlayTick])

  const setOverlayTarget = useCallback((trigger: string, targetProgress: number) => {
    if (!runtimeDocument || !controlledRenderState || !usesOverlayComposition) return false
    const transition = morphRuntimePlayerOverlayTransitionForTriggerV0(runtimeDocument.scene, trigger)
    if (!transition || !transition.to || transition.to === runtimeDocument.scene.entry) return false
    const now = performance.now()
    const previous = overlayChannelsRef.current[trigger]
    const progress = previous?.progress ?? 0
    overlayChannelsRef.current[trigger] = {
      trigger,
      fromState: transition.from && transition.from !== '*' ? transition.from : null,
      state: transition.to,
      progress,
      fromProgress: progress,
      targetProgress: clampProgress(targetProgress),
      startedAt: now,
      durationMs: nonNegative(transition.durationMs, MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS),
      easing: transition.easing ?? 'smoothstep',
      phase: targetProgress > progress ? 'enter' : targetProgress < progress ? 'return' : 'settled',
    }
    overlayBaseRenderStateRef.current = controlledRenderState
    renderFrame(renderStateWithOverlays(controlledRenderState, now), now)
    startOverlayAnimation()
    return true
  }, [controlledRenderState, renderFrame, renderStateWithOverlays, runtimeDocument, startOverlayAnimation, usesOverlayComposition])

  const pulseOverlay = useCallback((trigger: string) => {
    if (!runtimeDocument || !controlledRenderState || !usesOverlayComposition) return false
    const transition = morphRuntimePlayerOverlayTransitionForTriggerV0(runtimeDocument.scene, trigger)
    if (!transition) return false
    if (overlayTimerRefs.current[trigger] != null) window.clearTimeout(overlayTimerRefs.current[trigger])
    const started = setOverlayTarget(trigger, 1)
    if (!started) return false
    const holdMs = nonNegative(transition.holdMs, 80)
    const durationMs = nonNegative(transition.durationMs, MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS)
    overlayTimerRefs.current[trigger] = window.setTimeout(() => {
      delete overlayTimerRefs.current[trigger]
      setOverlayTarget(trigger, 0)
    }, reduceMotionRef.current ? 0 : durationMs + holdMs)
    return true
  }, [controlledRenderState, runtimeDocument, setOverlayTarget, usesOverlayComposition])

  const scheduleReturn = useCallback((delayMs: number) => {
    if (!timing) return
    clearReturnTimer()
    const runReturn = () => {
      returnTimerRef.current = null
      sendTrigger('hover-off', false)
    }
    const waitMs = nonNegative(delayMs, timing.returnDelayMs)
    if (waitMs <= 0 || reduceMotionRef.current) {
      runReturn()
      return
    }
    if (svgRef.current) svgRef.current.dataset.morphRuntimePhase = 'return-wait'
    returnTimerRef.current = window.setTimeout(runReturn, waitMs)
  }, [clearReturnTimer, sendTrigger, timing])

  const handleEnter = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    if (pointerPressedRef.current) return
    if (pointerInsideRef.current) return
    pointerInsideRef.current = true
    clearReturnTimer()
    if (controlledRenderState && usesOverlayComposition && setOverlayTarget('hover-on', 1)) return
    sendTrigger('hover-on', true)
  }, [clearReturnTimer, controlledRenderState, interactive, runtimeDocument, sendTrigger, setOverlayTarget, timing, usesOverlayComposition])

  const handleReturn = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    if (!pointerInsideRef.current) return
    pointerInsideRef.current = false
    if (controlledRenderState && usesOverlayComposition && setOverlayTarget('hover-on', 0)) return
    scheduleReturn(timing.returnDelayMs)
  }, [controlledRenderState, interactive, runtimeDocument, scheduleReturn, setOverlayTarget, timing, usesOverlayComposition])

  const handlePress = useCallback((event: MouseEvent<SVGSVGElement> | PointerEvent<SVGSVGElement>) => {
    event.preventDefault()
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    pointerInsideRef.current = true
    pointerPressedRef.current = true
    clearReturnTimer()
    if (controlledRenderState && usesOverlayComposition) {
      pulseOverlay('click')
      return
    }
    sendTrigger('press', true)
  }, [clearReturnTimer, controlledRenderState, interactive, pulseOverlay, runtimeDocument, sendTrigger, timing, usesOverlayComposition])

  const handleRelease = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    const wasPressed = pointerPressedRef.current
    pointerPressedRef.current = false
    if (controlledRenderState && usesOverlayComposition) {
      if (wasPressed || pointerInsideRef.current) pulseOverlay('click')
      return
    }
    if (pointerInsideRef.current) {
      sendTrigger('release', true)
      return
    }
    scheduleReturn(0)
  }, [controlledRenderState, interactive, pulseOverlay, runtimeDocument, scheduleReturn, sendTrigger, timing, usesOverlayComposition])

  const handleActivate = useCallback(() => {
    if (!timing || !runtimeDocument || !morphRuntimePlayerInteractiveEnabledV0(runtimeDocument, reduceMotionRef.current, interactive)) return
    clearReturnTimer()
    if (controlledRenderState && usesOverlayComposition) {
      if (pulseOverlay('click')) return
      if (setOverlayTarget('hover-on', 1)) return
    }
    sendTrigger('hover-on', true)
    if (timing.holdMs > 0) scheduleReturn(timing.enterDurationMs + timing.holdMs + timing.returnDelayMs)
  }, [clearReturnTimer, controlledRenderState, interactive, pulseOverlay, runtimeDocument, scheduleReturn, sendTrigger, setOverlayTarget, timing, usesOverlayComposition])

  const handleKeyDown = useCallback((event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    handleActivate()
  }, [handleActivate])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    reduceMotionRef.current = reducedMotion
    clearReturnTimer()
    stopAnimation()
    const resetProgress = runtimeDocument ? morphRuntimePlayerInitialProgressV0(runtimeDocument, initialProgress, reducedMotion) : initialProgress
    const resetRenderState = controlledRenderState ?? initialRenderState(runtimeDocument?.scene, targetState, resetProgress)
    overlayBaseRenderStateRef.current = resetRenderState
    if (!usesOverlayComposition) {
      clearOverlayTimers()
      stopOverlayAnimation()
      overlayChannelsRef.current = {}
    }
    stateEngineRef.current = runtimeDocument && !controlledRenderState ? createMorphRuntimePlayerStateEngineV0(runtimeDocument.scene, performance.now()) : null
    activeTriggerRef.current = null
    pointerInsideRef.current = false
    pointerPressedRef.current = false
    triggerSignalRef.current = null
    frameRef.current = 0
    lastRenderAtRef.current = 0
    renderFrame(renderStateWithOverlays(resetRenderState))
    return () => {
      clearReturnTimer()
      stopAnimation()
      if (!usesOverlayComposition) {
        stopOverlayAnimation()
        clearOverlayTimers()
      }
    }
  }, [clearOverlayTimers, clearReturnTimer, controlledRenderState, initialProgress, renderFrame, renderStateWithOverlays, runtimeDocument, stopAnimation, stopOverlayAnimation, targetState, usesOverlayComposition])

  useEffect(() => () => {
    stopOverlayAnimation()
    clearOverlayTimers()
  }, [clearOverlayTimers, stopOverlayAnimation])

  useEffect(() => {
    if (!triggerSignal) return
    if (triggerSignalRef.current === triggerSignal.signal) return
    triggerSignalRef.current = triggerSignal.signal
    sendHostTrigger(triggerSignal)
  }, [sendHostTrigger, triggerSignal])

  if (!runtimeDocument) return null

  const [width, height] = runtimeDocument.scene.viewBox
  const label = sceneLabel(runtimeDocument, title)
  const effectiveInteractive = interactive && (!controlledRenderState || usesOverlayComposition) && (contractStatus?.supported ?? false)
  const initialFieldStatus = morphRuntimeFieldCacheStatusV0(runtimeDocument, {
    state: firstRenderState.state,
    progress: firstRenderState.progress,
  })
  const initialFieldCacheSource = firstRenderState.fromState ? 'live-fallback' : initialFieldStatus.source
  const initialFieldCacheMatches = firstRenderState.fromState ? '0' : String(initialFieldStatus.matchingLayers)

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      role={effectiveInteractive ? 'button' : 'img'}
      aria-label={label}
      tabIndex={effectiveInteractive ? 0 : undefined}
      data-morph-runtime-state-engine-player
      data-morph-runtime-schema={runtimeDocument.schema}
      data-morph-runtime-scene={runtimeDocument.scene.id}
      data-morph-runtime-supported={contractStatus?.supported ? 'true' : 'false'}
      data-morph-runtime-state={firstRenderState.state ?? 'rest'}
      data-morph-runtime-from-state={firstRenderState.fromState ?? 'rest'}
      data-morph-runtime-progress={firstRenderState.progress.toFixed(3)}
      data-morph-runtime-phase={firstRenderState.phase}
      data-morph-runtime-controller={firstRenderState.controllerId}
      data-morph-runtime-controller-value={firstRenderState.controllerValue?.toFixed(3)}
      data-morph-runtime-scroll-progress={firstRenderState.scrubProgress?.toFixed(3)}
      data-morph-runtime-scroll-eased-progress={firstRenderState.scrubEasedProgress?.toFixed(3)}
      data-morph-runtime-scroll-track={firstRenderState.scrubTrack?.join(',')}
      data-morph-runtime-field-cache-policy={initialFieldStatus.policy}
      data-morph-runtime-field-cache-source={initialFieldCacheSource}
      data-morph-runtime-field-cache-matching-layers={initialFieldCacheMatches}
      data-morph-runtime-field-cache-progresses={initialFieldStatus.cachedProgresses.join(',')}
      focusable={effectiveInteractive ? 'true' : 'false'}
      preserveAspectRatio="xMidYMid meet"
      onPointerEnter={effectiveInteractive ? handleEnter : undefined}
      onPointerMove={effectiveInteractive ? handleEnter : undefined}
      onPointerLeave={effectiveInteractive ? handleReturn : undefined}
      onPointerDown={effectiveInteractive ? handlePress : undefined}
      onPointerUp={effectiveInteractive ? handleRelease : undefined}
      onPointerCancel={effectiveInteractive ? handleReturn : undefined}
      onMouseEnter={effectiveInteractive ? handleEnter : undefined}
      onMouseMove={effectiveInteractive ? handleEnter : undefined}
      onMouseDown={effectiveInteractive ? handlePress : undefined}
      onMouseUp={effectiveInteractive ? handleRelease : undefined}
      onMouseLeave={effectiveInteractive ? handleReturn : undefined}
      onFocus={effectiveInteractive ? handleEnter : undefined}
      onBlur={effectiveInteractive ? handleReturn : undefined}
      onClick={effectiveInteractive ? handleActivate : undefined}
      onKeyDown={effectiveInteractive ? handleKeyDown : undefined}
      dangerouslySetInnerHTML={{ __html: initialMarkup }}
    />
  )
}
