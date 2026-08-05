/**
 * Drawable state engine — a pure interaction/timing driver for Morph Lab scenes.
 *
 * It deliberately knows nothing about SVG, layers, paths, shaders, or React. Tabs
 * feed it pointer / scroll / time events; renderers use the returned state and
 * progress to choose geometry, transforms, shader frames, and write-on progress.
 */

export const STATE_ENGINE_RETURN_TARGET = '@return'

export type StateEngineTrigger =
  | 'rest'
  | 'hover'
  | 'hover-on'
  | 'hover-off'
  | 'press'
  | 'release'
  | 'click'
  | 'in-view'
  | 'inView'
  | 'scroll-past'
  | 'scrub'
  | 'proximity'
  | 'idle'
  | 'on-arrive'

export type StateInterruptMode = 'restart' | 'continue' | 'queue' | 'ignore'

export type StateTransitionRule = {
  id?: string
  from?: string | '*'
  to: string
  trigger: StateEngineTrigger | string
  durationMs?: number
  easing?: string
  fps?: number
  fpsDivisor?: 1 | 2 | 4
  delayMs?: number
  holdMs?: number
  returnTo?: string
  returnDelayMs?: number
  returnDurationMs?: number
  interrupt?: StateInterruptMode
  idleMs?: number
  atScrollPx?: number
  style?: 'auto' | 'shape' | 'write-on' | 'pieces' | 'transform' | 'shader' | string
}

export type StateEngineDefinition = {
  entry?: string
  stateIds?: string[]
  transitions?: StateTransitionRule[]
  scrub?: {
    source?: 'element' | 'page' | 'section'
    startPx?: number
    endPx?: number
    smoothing?: number
  }
  proximity?: {
    radius?: number
    target?: string
  }
  fps?: number
  fpsDivisor?: 1 | 2 | 4
}

export type StateEngineInput = {
  trigger: StateEngineTrigger | string
  now?: number
  pointerInside?: boolean
  scrollPx?: number
  scrubProgress?: number
}

export type StateEngineSnapshot = {
  stateId: string
  fromStateId: string
  targetStateId: string
  transition: StateTransitionRule | null
  trigger: string | null
  progress: number
  easedProgress: number
  durationMs: number
  easing: string
  fps: number | null
  fpsDivisor: 1 | 2 | 4
  startedAt: number
  settled: boolean
}

type EngineState = {
  stateId: string
  fromStateId: string
  targetStateId: string
  transition: StateTransitionRule | null
  trigger: string | null
  progress: number
  easedProgress: number
  durationMs: number
  easing: string
  fps: number | null
  fpsDivisor: 1 | 2 | 4
  startedAt: number
  settledAt: number
  pointerInside: boolean
  autoKeys: Set<string>
}

const DEFAULT_ENTRY = 'rest'
const DEFAULT_DURATION_MS = 280
const DEFAULT_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function normalizeStateTrigger(trigger: StateEngineTrigger | string): string {
  if (trigger === 'hover') return 'hover-on'
  if (trigger === 'inView') return 'in-view'
  return trigger
}

export function findStateTransition(
  definition: StateEngineDefinition,
  fromStateId: string,
  trigger: StateEngineTrigger | string,
): StateTransitionRule | null {
  const normalized = normalizeStateTrigger(trigger)
  const transitions = definition.transitions ?? []
  return (
    transitions.find((rule) => normalizeStateTrigger(rule.trigger) === normalized && rule.from === fromStateId) ??
    transitions.find((rule) => normalizeStateTrigger(rule.trigger) === normalized && rule.from === '*') ??
    transitions.find((rule) => normalizeStateTrigger(rule.trigger) === normalized && !rule.from) ??
    null
  )
}

export function createStateEngine(definition: StateEngineDefinition, options: { now?: number } = {}) {
  const entry = definition.entry ?? definition.stateIds?.[0] ?? DEFAULT_ENTRY
  const now = options.now ?? 0
  const state: EngineState = {
    stateId: entry,
    fromStateId: entry,
    targetStateId: entry,
    transition: null,
    trigger: null,
    progress: 1,
    easedProgress: 1,
    durationMs: 0,
    easing: DEFAULT_EASING,
    fps: null,
    fpsDivisor: definition.fpsDivisor ?? 1,
    startedAt: now,
    settledAt: now,
    pointerInside: false,
    autoKeys: new Set(),
  }

  function snapshot(): StateEngineSnapshot {
    return {
      stateId: state.stateId,
      fromStateId: state.fromStateId,
      targetStateId: state.targetStateId,
      transition: state.transition,
      trigger: state.trigger,
      progress: state.progress,
      easedProgress: state.easedProgress,
      durationMs: state.durationMs,
      easing: state.easing,
      fps: state.fps,
      fpsDivisor: state.fpsDivisor,
      startedAt: state.startedAt,
      settled: !state.transition,
    }
  }

  function reset(nextNow = now, nextStateId = entry): StateEngineSnapshot {
    state.stateId = nextStateId
    state.fromStateId = nextStateId
    state.targetStateId = nextStateId
    state.transition = null
    state.trigger = null
    state.progress = 1
    state.easedProgress = 1
    state.durationMs = 0
    state.startedAt = nextNow
    state.settledAt = nextNow
    state.autoKeys.clear()
    return snapshot()
  }

  function send(input: StateEngineInput): StateEngineSnapshot {
    const inputNow = input.now ?? state.startedAt
    if (typeof input.pointerInside === 'boolean') state.pointerInside = input.pointerInside

    if (input.trigger !== 'scrub') tick(inputNow)

    const trigger = normalizeStateTrigger(input.trigger)
    const fromStateId = state.transition ? state.targetStateId : state.stateId
    const transition = findStateTransition(definition, fromStateId, trigger) ?? findStateTransition(definition, state.stateId, trigger)
    if (!transition || !passesGate(transition, input)) return snapshot()

    state.autoKeys.clear()
    return beginTransition(transition, fromStateId, trigger, inputNow, input)
  }

  function tick(nextNow: number): StateEngineSnapshot {
    advanceTransition(nextNow)
    runAutomaticTransitions(nextNow)
    return snapshot()
  }

  function beginTransition(
    transition: StateTransitionRule,
    fromStateId: string,
    trigger: string,
    transitionNow: number,
    input: StateEngineInput = { trigger },
  ): StateEngineSnapshot {
    const targetStateId = resolveTargetState(definition, transition.to, state.pointerInside)
    const durationMs = Math.max(0, transition.durationMs ?? DEFAULT_DURATION_MS)
    const fpsDivisor = transition.fpsDivisor ?? definition.fpsDivisor ?? 1
    const fps = effectiveFps(transition.fps ?? definition.fps ?? null, fpsDivisor)
    const progress = trigger === 'scrub' && typeof input.scrubProgress === 'number' ? clamp01(input.scrubProgress) : 0

    state.fromStateId = fromStateId
    state.targetStateId = targetStateId
    state.transition = transition
    state.trigger = trigger
    state.durationMs = durationMs
    state.easing = transition.easing ?? DEFAULT_EASING
    state.fps = fps
    state.fpsDivisor = fpsDivisor
    state.startedAt = transitionNow - progress * durationMs
    state.progress = durationMs === 0 ? 1 : progress
    state.easedProgress = easeProgress(state.progress, state.easing)

    if (durationMs === 0 || state.progress >= 1) settleTransition(transitionNow)
    return snapshot()
  }

  function advanceTransition(nextNow: number) {
    if (!state.transition) return
    if (state.trigger === 'scrub') return

    const elapsedMs = Math.max(0, quantizedNow(nextNow, state.startedAt, state.fps) - state.startedAt)
    state.progress = state.durationMs <= 0 ? 1 : clamp01(elapsedMs / state.durationMs)
    state.easedProgress = easeProgress(state.progress, state.easing)
    if (state.progress >= 1) settleTransition(nextNow)
  }

  function settleTransition(nextNow: number) {
    state.stateId = state.targetStateId
    state.fromStateId = state.targetStateId
    state.transition = null
    state.trigger = null
    state.progress = 1
    state.easedProgress = 1
    state.durationMs = 0
    state.startedAt = nextNow
    state.settledAt = nextNow
  }

  function runAutomaticTransitions(nextNow: number) {
    for (let i = 0; i < 3 && !state.transition; i += 1) {
      const onArrive = findStateTransition(definition, state.stateId, 'on-arrive')
      if (onArrive && runAutomaticTransition(onArrive, 'on-arrive', nextNow)) continue

      const idle = findStateTransition(definition, state.stateId, 'idle')
      if (!idle) return
      const idleMs = Math.max(0, idle.idleMs ?? 0)
      if (nextNow - state.settledAt < idleMs) return
      if (!runAutomaticTransition(idle, 'idle', nextNow)) return
    }
  }

  function runAutomaticTransition(transition: StateTransitionRule, trigger: string, transitionNow: number): boolean {
    const key = `${state.stateId}:${trigger}:${transition.to}`
    if (state.autoKeys.has(key)) return false
    state.autoKeys.add(key)
    beginTransition(transition, state.stateId, trigger, transitionNow)
    return true
  }

  return { snapshot, reset, send, tick }
}

function resolveTargetState(definition: StateEngineDefinition, to: string, pointerInside: boolean): string {
  if (to !== STATE_ENGINE_RETURN_TARGET) return to
  if (pointerInside) {
    const hoverTarget = findStateTransition(definition, definition.entry ?? DEFAULT_ENTRY, 'hover-on')?.to
    if (hoverTarget && hoverTarget !== STATE_ENGINE_RETURN_TARGET) return hoverTarget
  }
  return definition.entry ?? definition.stateIds?.[0] ?? DEFAULT_ENTRY
}

function passesGate(transition: StateTransitionRule, input: StateEngineInput): boolean {
  if (normalizeStateTrigger(input.trigger) !== 'scroll-past') return true
  if (typeof transition.atScrollPx !== 'number') return true
  return (input.scrollPx ?? 0) >= transition.atScrollPx
}

function effectiveFps(fps: number | null, divisor: 1 | 2 | 4): number | null {
  if (!fps || fps <= 0) return null
  return Math.max(1, fps / divisor)
}

function quantizedNow(now: number, startedAt: number, fps: number | null): number {
  if (!fps) return now
  const frameMs = 1000 / fps
  return startedAt + Math.floor((now - startedAt) / frameMs) * frameMs
}

function easeProgress(progress: number, easing: string): number {
  const t = clamp01(progress)
  if (easing === 'linear') return t
  if (easing === 'ease-in') return t * t
  if (easing === 'ease-out') return 1 - (1 - t) * (1 - t)
  if (easing === 'ease-in-out' || easing === 'smoothstep') return t * t * (3 - 2 * t)
  if (easing === 'easeOutExpo') return t >= 1 ? 1 : 1 - 2 ** (-10 * t)
  return t
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}
