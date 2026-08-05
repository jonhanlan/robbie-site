import type { DrawableScene } from '../runtime'
import { createStateEngine, type StateEngineSnapshot, type StateTransitionRule } from '../drawable/state-engine'
import { stateEngineDefinitionForDrawableScene } from '../drawable/state-graph'

export const MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS = 320
export const MORPH_RUNTIME_PLAYER_DEFAULT_EASING = 'smoothstep'
export const MORPH_RUNTIME_PLAYER_DEFAULT_RENDER_FPS = 30

export type MorphRuntimePlayerTimingV0 = {
  enterDurationMs: number
  returnDelayMs: number
  returnDurationMs: number
  holdMs: number
  returnTo: string
  easing: string
  interrupt: StateTransitionRule['interrupt']
  renderFps: number
  renderIntervalMs: number
}

export type MorphRuntimePlayerRenderStateV0 = {
  fromState?: string | null
  state: string | null
  progress: number
  phase: 'rest' | 'enter' | 'return' | 'settled' | 'scrub'
  overlays?: MorphRuntimePlayerOverlayStateV0[]
  controllerId?: string
  controllerValue?: number
  scrubProgress?: number
  scrubEasedProgress?: number
  scrubTrack?: string[]
}

export type MorphRuntimePlayerOverlayStateV0 = {
  trigger: string
  fromState?: string | null
  state: string
  progress: number
  phase?: 'enter' | 'return' | 'settled'
}

export type MorphRuntimePlayerControllerValueV0 =
  | boolean
  | number
  | string
  | { x: number; y: number }
  | null
  | undefined

export type MorphRuntimePlayerControllerValuesV0 = Record<string, MorphRuntimePlayerControllerValueV0>

export function createMorphRuntimePlayerStateEngineV0(scene: DrawableScene, now = 0) {
  return createStateEngine(stateEngineDefinitionForDrawableScene(scene), { now })
}

export function morphRuntimePlayerTargetStateV0(scene: DrawableScene, preferred?: string): string | null {
  if (preferred) return preferred
  const hoverTransition = hoverTransitionForScene(scene)
  return hoverTransition?.to && hoverTransition.to !== '@return' ? hoverTransition.to : firstLayerState(scene)
}

export function morphRuntimePlayerTimingV0(scene: DrawableScene): MorphRuntimePlayerTimingV0 {
  const hoverTransition = hoverTransitionForScene(scene)
  const hoverOffTransition = hoverOffTransitionForScene(scene)
  const enterDurationMs = nonNegative(hoverTransition?.durationMs, MORPH_RUNTIME_PLAYER_DEFAULT_DURATION_MS)
  const renderFps = transitionRenderFps(hoverTransition)
  return {
    enterDurationMs,
    returnDelayMs: nonNegative(hoverOffTransition?.delayMs ?? hoverTransition?.returnDelayMs, 0),
    returnDurationMs: nonNegative(hoverOffTransition?.durationMs ?? hoverTransition?.returnDurationMs, enterDurationMs),
    holdMs: nonNegative(hoverTransition?.holdMs, 0),
    returnTo: hoverOffTransition?.to ?? hoverTransition?.returnTo ?? scene.returnTarget ?? scene.entry ?? 'rest',
    easing: hoverTransition?.easing ?? hoverOffTransition?.easing ?? MORPH_RUNTIME_PLAYER_DEFAULT_EASING,
    interrupt: hoverTransition?.interrupt ?? hoverOffTransition?.interrupt ?? 'restart',
    renderFps,
    renderIntervalMs: 1000 / renderFps,
  }
}

export function morphRuntimePlayerRenderStateForSnapshotV0(
  scene: DrawableScene,
  snapshot: StateEngineSnapshot,
  preferredState?: string,
): MorphRuntimePlayerRenderStateV0 {
  const entry = scene.entry ?? 'rest'
  if (snapshot.settled) {
    if (snapshot.stateId === entry) return morphRuntimePlayerRestRenderStateV0(scene)
    return { fromState: null, state: preferredState ?? snapshot.stateId, progress: 1, phase: 'settled' }
  }

  if (snapshot.targetStateId === entry && snapshot.fromStateId !== entry) {
    return {
      fromState: null,
      state: preferredState ?? snapshot.fromStateId,
      progress: 1 - snapshot.easedProgress,
      phase: 'return',
    }
  }

  const state = snapshot.targetStateId === entry ? null : snapshot.targetStateId
  return {
    fromState: snapshot.fromStateId !== entry && snapshot.fromStateId !== snapshot.targetStateId ? snapshot.fromStateId : null,
    state: preferredState ?? state,
    progress: snapshot.targetStateId === entry ? 0 : snapshot.easedProgress,
    phase: 'enter',
  }
}

export function morphRuntimePlayerRestRenderStateV0(
  scene?: DrawableScene,
): MorphRuntimePlayerRenderStateV0 {
  return {
    fromState: null,
    state: scene ? morphRuntimePlayerTargetStateV0(scene) : null,
    progress: 0,
    phase: 'rest',
  }
}

export function morphRuntimePlayerRenderStateForControllerValuesV0(
  scene: DrawableScene,
  controllerValues?: MorphRuntimePlayerControllerValuesV0,
): MorphRuntimePlayerRenderStateV0 | null {
  if (!scene.scrub) return null
  const rawProgress = numericControllerValue(controllerValues?.['scroll-progress'])
  if (rawProgress == null) return null

  const track = scene.scrub.track?.filter((stateId) => typeof stateId === 'string' && stateId.trim()) ?? []
  if (track.length < 2) return null

  const directedProgress = scene.scrub.direction === 'reverse' ? 1 - clampProgress(rawProgress) : clampProgress(rawProgress)
  const easedProgress = morphRuntimePlayerEaseProgressV0(directedProgress, scene.scrub.easing ?? MORPH_RUNTIME_PLAYER_DEFAULT_EASING)
  const segmentPosition = easedProgress * (track.length - 1)
  const boundaryIndex = integerBoundary(segmentPosition)
  if (boundaryIndex != null) {
    return {
      fromState: null,
      state: track[boundaryIndex] ?? track[0] ?? null,
      progress: boundaryIndex === 0 ? 0 : 1,
      phase: 'scrub',
      controllerId: 'scroll-progress',
      controllerValue: clampProgress(rawProgress),
      scrubProgress: directedProgress,
      scrubEasedProgress: easedProgress,
      scrubTrack: track,
    }
  }

  const segmentIndex = Math.max(0, Math.min(track.length - 2, Math.floor(segmentPosition)))
  const fromState = track[segmentIndex] ?? track[0] ?? null
  const state = track[segmentIndex + 1] ?? fromState
  return {
    fromState: fromState === scene.entry ? null : fromState,
    state,
    progress: clampProgress(segmentPosition - segmentIndex),
    phase: 'scrub',
    controllerId: 'scroll-progress',
    controllerValue: clampProgress(rawProgress),
    scrubProgress: directedProgress,
    scrubEasedProgress: easedProgress,
    scrubTrack: track,
  }
}

export function morphRuntimePlayerUsesAdditiveOverlaysV0(scene: DrawableScene): boolean {
  return scene.composition?.mode === 'scrub-additive-overlays'
}

export function morphRuntimePlayerOverlayTransitionForTriggerV0(scene: DrawableScene, trigger: string): StateTransitionRule | undefined {
  if (!morphRuntimePlayerUsesAdditiveOverlaysV0(scene)) return undefined
  const definition = stateEngineDefinitionForDrawableScene(scene)
  return definition.transitions?.find((transition) => transition.trigger === trigger && !!transition.to && transition.to !== scene.entry)
}

function hoverTransitionForScene(scene: DrawableScene): StateTransitionRule | undefined {
  const definition = stateEngineDefinitionForDrawableScene(scene)
  return definition.transitions?.find((transition) => transition.trigger === 'hover' || transition.trigger === 'hover-on')
}

function hoverOffTransitionForScene(scene: DrawableScene): StateTransitionRule | undefined {
  const definition = stateEngineDefinitionForDrawableScene(scene)
  return definition.transitions?.find((transition) => transition.trigger === 'hover-off')
}

function firstLayerState(scene: DrawableScene): string | null {
  for (const layer of scene.layers) {
    const state = layer.states ? Object.keys(layer.states)[0] : undefined
    if (state) return state
  }
  return null
}

export function nonNegative(value: number | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}

function numericControllerValue(value: MorphRuntimePlayerControllerValueV0): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value)
  return null
}

function integerBoundary(value: number): number | null {
  const rounded = Math.round(value)
  return Math.abs(value - rounded) <= 0.000001 ? rounded : null
}

export function clampProgress(progress: number | undefined): number {
  if (!Number.isFinite(progress as number)) return 0
  return Math.min(1, Math.max(0, progress as number))
}

export function morphRuntimePlayerEaseProgressV0(progress: number, easing: string): number {
  const t = clampProgress(progress)
  if (easing === 'linear') return t
  if (easing === 'ease-in') return t * t
  if (easing === 'ease-out') return 1 - (1 - t) * (1 - t)
  if (easing === 'ease-in-out' || easing === 'smoothstep') return t * t * (3 - 2 * t)
  if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - 2 ** (-10 * t)
  if (easing === 'easeOutBack') {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2
  }
  return t
}

function transitionRenderFps(transition: StateTransitionRule | undefined): number {
  const baseFps = typeof transition?.fps === 'number' && Number.isFinite(transition.fps) && transition.fps > 0
    ? transition.fps
    : MORPH_RUNTIME_PLAYER_DEFAULT_RENDER_FPS
  const divisor = transition?.fpsDivisor === 2 || transition?.fpsDivisor === 4 ? transition.fpsDivisor : 1
  return Math.max(1, Math.min(60, baseFps / divisor))
}
