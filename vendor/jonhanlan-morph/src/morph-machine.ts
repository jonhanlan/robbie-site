// Morph state machine — a small Rive-style graph of poses connected by triggered
// transitions. The geometry primitives all live in morph-core / the hand-drawn
// engine; this module only adds the bookkeeping layer (which pose am I in, which
// transition fires on which trigger, and how to blend between any two poses).
//
// Every pose is aligned to the entry pose's point ordering up front, so blending
// between ANY pair of poses (or from a mid-blend shape onward) is coherent with
// zero per-frame alignment cost.

import {
  alignClosedPathToReference,
  resampleClosedPath,
  type MorphPoint,
} from './geometry/morph-core'
import {
  HAND_DRAWN_MORPH_INPUT_POINTS,
  pointsFromHandDrawnPathInput,
  resolveHandDrawnMorphEdgeStyle,
  type HandDrawnMorphEdgeStyle,
  type HandDrawnMorphPathInput,
} from './hand-drawn-morph-engine'

export type MorphTrigger =
  | 'hover-on'
  | 'hover-off'
  | 'click'
  | 'press'
  | 'release'
  | 'in-view'
  | 'idle'
  | 'on-arrive'
  | 'scroll-past'

/**
 * Where a scroll scrub reads its 0→1 progress from:
 * - 'element' : the asset's own travel through the viewport (0 entering from the
 *   bottom, 1 leaving past the top). Self-contained — works on any page, no setup.
 * - 'page'    : whole-document scroll (top = 0, bottom = 1).
 * - 'section' : the band between two named elements (startId → endId), e.g. scrub
 *   from the #about section through the bottom of #shop. endId defaults to startId.
 */
export type ScrollSourceType = 'element' | 'page' | 'section'

export interface ScrollSource {
  type: ScrollSourceType
  startId?: string
  endId?: string
}

/**
 * A scroll-bound morph: as the source's progress moves 0→1 the outline walks an
 * ordered track of poses (track[0] → track[1] → … → track[n-1]), reversible. This
 * is a continuous driver, separate from the triggered transition graph: an asset
 * with a scrub is scroll-driven rather than hover/click-driven.
 */
export interface MorphScrubDef {
  /** Ordered pose ids the morph blends across. Needs at least two. */
  track: string[]
  source: ScrollSource
  /** Eased remap of the raw scroll progress before it drives the track. */
  easing?: MorphEasing
  /** 0 = follow scroll exactly; →1 adds inertia (laggier catch-up). */
  smoothing?: number
  /** Re-jitter the hand-drawn edge as it scrubs (alive, but busier). Default off. */
  shimmer?: boolean
}

export type MorphEasing =
  | 'linear'
  | 'smoothstep'
  | 'easeOutExpo'
  | 'easeInOutCubic'
  | 'easeOutBack'

export type MorphStyle = 'scrappy' | 'smooth'

/** A named pose: one closed outline plus its own edge texture. */
export interface MorphPoseDef {
  id: string
  label?: string
  path: HandDrawnMorphPathInput
  edgeStyle?: Partial<HandDrawnMorphEdgeStyle>
}

/** A one-way arrow from one pose to another, fired by a trigger. */
export interface MorphTransitionDef {
  from: string // pose id, or '*' for "any pose"
  to: string
  trigger: MorphTrigger
  durationMs?: number
  easing?: MorphEasing
  style?: MorphStyle
  /** Edge re-jitter frame rate for scrappy moves. Ignored when style is smooth. */
  fps?: number
  /** For trigger 'idle': how long the pose must sit still before firing. */
  idleMs?: number
  /** For trigger 'scroll-past': window scrollY (px) the page must pass to fire. */
  atScrollPx?: number
}

export interface MorphMachineDef {
  poses: MorphPoseDef[]
  entry?: string
  transitions: MorphTransitionDef[]
  /** Optional scroll-bound morph. When present the asset is scroll-driven. */
  scrub?: MorphScrubDef
}

export const POSE_SOFT_CAP = 6

// Sentinel transition target meaning "return to the natural state": the hover
// pose if the pointer is still inside, otherwise the entry pose. Used by
// tap-and-return click poses (on-arrive). The runtime resolves it live.
export const MORPH_RETURN_TARGET = '@return'

export const MORPH_TRIGGERS: MorphTrigger[] = [
  'hover-on',
  'hover-off',
  'click',
  'press',
  'release',
  'in-view',
  'idle',
  'on-arrive',
  'scroll-past',
]

export const MORPH_EASINGS: Record<MorphEasing, (t: number) => number> = {
  linear: (t) => t,
  smoothstep: (t) => t * t * (3 - 2 * t),
  easeOutExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => {
    const c1 = 1.70158
    const c3 = c1 + 1
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
  },
}

export function resolveEasing(name: MorphEasing | undefined) {
  return MORPH_EASINGS[name ?? 'smoothstep'] ?? MORPH_EASINGS.smoothstep
}

const DEFAULT_TRANSITION_MS = 700

/** Blend two edge-style objects field-by-field at progress t (0..1). */
export function blendEdgeStyle(
  from: HandDrawnMorphEdgeStyle,
  to: HandDrawnMorphEdgeStyle,
  t: number,
): HandDrawnMorphEdgeStyle {
  if (t <= 0) return from
  if (t >= 1) return to
  const out = {} as HandDrawnMorphEdgeStyle
  for (const key of Object.keys(from) as Array<keyof HandDrawnMorphEdgeStyle>) {
    out[key] = from[key] + (to[key] - from[key]) * t
  }
  return out
}

/** Turn the old two-path (pathA/pathB) shape into a rest↔hover machine. */
export function machineFromLegacy(
  pathA: HandDrawnMorphPathInput,
  pathB: HandDrawnMorphPathInput,
  edgeStyle?: Partial<HandDrawnMorphEdgeStyle>,
  fps?: number,
): MorphMachineDef {
  return {
    poses: [
      { id: 'rest', label: 'Resting', path: pathA, edgeStyle },
      { id: 'hover', label: 'Hover', path: pathB, edgeStyle },
    ],
    entry: 'rest',
    transitions: [
      { from: 'rest', to: 'hover', trigger: 'hover-on', style: 'scrappy', easing: 'smoothstep', fps },
      { from: 'hover', to: 'rest', trigger: 'hover-off', style: 'scrappy', easing: 'smoothstep', fps },
    ],
  }
}

export interface PreparedPose {
  id: string
  label: string
  /** Input-resolution points, aligned to the entry pose's ordering. */
  points: MorphPoint[]
  edge: HandDrawnMorphEdgeStyle
}

export interface PreparedTransition {
  from: string
  to: string
  trigger: MorphTrigger
  durationMs: number
  easing: MorphEasing
  style: MorphStyle
  fps?: number
  idleMs: number
  atScrollPx?: number
}

export interface PreparedScrub {
  /** Validated pose ids (all exist in the machine), length >= 2. */
  track: string[]
  source: ScrollSource
  easing: MorphEasing
  smoothing: number
  shimmer: boolean
}

export interface PreparedMachine {
  poses: Map<string, PreparedPose>
  order: string[]
  entry: string
  transitions: PreparedTransition[]
  scrub: PreparedScrub | null
}

/**
 * Resolve a machine definition into render-ready geometry: every pose resampled
 * to the engine's working resolution and aligned to the entry pose, plus
 * fully-defaulted transitions. `baseEdge` is the asset-level edge style each
 * pose merges over.
 */
export function prepareMachine(
  def: MorphMachineDef,
  baseEdge?: Partial<HandDrawnMorphEdgeStyle>,
  fallbackPoints?: MorphPoint[],
): PreparedMachine {
  const poseList = def.poses.filter((pose) => pose && pose.id)
  const entry = def.entry && poseList.some((p) => p.id === def.entry) ? def.entry : poseList[0]?.id ?? 'rest'

  const fallback =
    fallbackPoints && fallbackPoints.length >= 3
      ? fallbackPoints
      : resampleClosedPath(
          pointsFromHandDrawnPathInput(undefined, [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
          ]),
          HAND_DRAWN_MORPH_INPUT_POINTS,
        )

  const rawPoints = new Map<string, MorphPoint[]>()
  for (const pose of poseList) {
    const resolved = pointsFromHandDrawnPathInput(pose.path, fallback)
    const sampled = resampleClosedPath(resolved, HAND_DRAWN_MORPH_INPUT_POINTS)
    rawPoints.set(pose.id, sampled.length >= 3 ? sampled : fallback)
  }

  const entryPoints = rawPoints.get(entry) ?? fallback

  const poses = new Map<string, PreparedPose>()
  const order: string[] = []
  for (const pose of poseList) {
    const raw = rawPoints.get(pose.id) ?? fallback
    const points = pose.id === entry ? raw : alignClosedPathToReference(raw, entryPoints)
    poses.set(pose.id, {
      id: pose.id,
      label: pose.label ?? pose.id,
      points,
      edge: resolveHandDrawnMorphEdgeStyle({ ...baseEdge, ...pose.edgeStyle }),
    })
    order.push(pose.id)
  }

  const transitions: PreparedTransition[] = def.transitions
    .filter((t) => t && t.trigger && (t.from === '*' || poses.has(t.from)) && (t.to === MORPH_RETURN_TARGET || poses.has(t.to)))
    .map((t) => ({
      from: t.from,
      to: t.to,
      trigger: t.trigger,
      durationMs: t.durationMs && t.durationMs > 0 ? t.durationMs : DEFAULT_TRANSITION_MS,
      easing: t.easing ?? 'smoothstep',
      style: t.style ?? 'scrappy',
      fps: t.fps,
      idleMs: t.idleMs && t.idleMs > 0 ? t.idleMs : 4000,
      atScrollPx: typeof t.atScrollPx === 'number' && t.atScrollPx >= 0 ? t.atScrollPx : undefined,
    }))

  const scrub = prepareScrub(def.scrub, poses)

  return { poses, order, entry, transitions, scrub }
}

/** Resolve a scrub definition, keeping only poses that exist. Returns null unless
 * at least two valid poses remain (a scrub needs something to blend between). */
function prepareScrub(
  def: MorphScrubDef | undefined,
  poses: Map<string, PreparedPose>,
): PreparedScrub | null {
  if (!def || !Array.isArray(def.track)) return null
  const track = def.track.filter((id) => poses.has(id))
  if (track.length < 2) return null
  const sourceType: ScrollSourceType =
    def.source?.type === 'page' || def.source?.type === 'section' ? def.source.type : 'element'
  return {
    track,
    source: {
      type: sourceType,
      startId: def.source?.startId?.trim() || undefined,
      endId: def.source?.endId?.trim() || undefined,
    },
    easing: def.easing ?? 'linear',
    smoothing: Math.min(0.95, Math.max(0, typeof def.smoothing === 'number' ? def.smoothing : 0)),
    shimmer: def.shimmer === true,
  }
}

/** First transition firing `trigger` from `currentPose` (or an any-pose '*' rule). */
export function findTransition(
  machine: PreparedMachine,
  currentPose: string,
  trigger: MorphTrigger,
): PreparedTransition | null {
  for (const t of machine.transitions) {
    if (t.trigger !== trigger) continue
    if (t.from !== currentPose && t.from !== '*') continue
    if (t.to === currentPose) continue
    return t
  }
  return null
}

/**
 * Validate a machine for the Lab's block-on-conflict save. Returns human-readable
 * problems: duplicate trigger out of the same pose, unknown pose references, etc.
 */
export function validateMachine(def: MorphMachineDef): string[] {
  const problems: string[] = []
  const ids = def.poses.map((p) => p.id)
  const idSet = new Set(ids)

  if (def.poses.length === 0) problems.push('Add at least one pose.')
  if (def.poses.length > POSE_SOFT_CAP) {
    problems.push(`That's ${def.poses.length} poses. Past ${POSE_SOFT_CAP} the graph gets hard to read — consider trimming.`)
  }
  if (ids.length !== idSet.size) problems.push('Two poses share the same id.')
  if (def.entry && !idSet.has(def.entry)) problems.push(`Entry pose "${def.entry}" does not exist.`)

  const seen = new Set<string>()
  for (const t of def.transitions) {
    if (t.from !== '*' && !idSet.has(t.from)) problems.push(`A transition starts from unknown pose "${t.from}".`)
    if (t.to !== MORPH_RETURN_TARGET && !idSet.has(t.to)) problems.push(`A transition points to unknown pose "${t.to}".`)
    const key = `${t.from}::${t.trigger}`
    if (seen.has(key)) {
      problems.push(`Pose "${t.from}" has two arrows on the same trigger (${t.trigger}). One trigger, one destination.`)
    }
    seen.add(key)
  }

  if (def.scrub) {
    const track = Array.isArray(def.scrub.track) ? def.scrub.track : []
    const validTrack = track.filter((id) => idSet.has(id))
    if (validTrack.length < 2) {
      problems.push('A scroll scrub needs at least two existing poses in its track.')
    }
    for (const id of track) {
      if (!idSet.has(id)) problems.push(`The scroll scrub references unknown pose "${id}".`)
    }
    if (def.scrub.source?.type === 'section' && !def.scrub.source.startId?.trim()) {
      problems.push('A section-based scroll scrub needs a start section id.')
    }
  }

  return problems
}
