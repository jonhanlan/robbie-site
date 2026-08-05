/**
 * Drawable Scene — the shared model Morph Lab authors and the site plays back.
 *
 * One vocabulary for all four lab tabs (Mask, Cursor, Sign, Animate). A scene is an
 * ordered, stable-id'd stack of layers; each layer carries its own geometry plus
 * separable edge / fill / inner shader passes and its own motion. Morphing is one
 * motion primitive here, not the centre of gravity.
 *
 * The static `packages/morph/lab/morph-lab.html` authoring tool cannot import
 * these types yet (it is standalone vanilla JS), so it authors JSON that conforms to these shapes
 * and the runtime imports the types to read that JSON. Keep this file pure: types
 * only, no runtime code, no imports, so it stays the neutral contract both sides
 * target.
 *
 * Status: Stage 0 of the Morph Lab → Drawable Scene plan (see
 * apps/me/MORPH-LAB-DRAWABLE-SCENE-PLAN.html). Adapters mapping today's published
 * data (cursor-states / morph-presets / signature JSON) onto this model arrive with
 * each tab's migration; until then this is the target shape, not yet the wire format.
 */

// ---- Geometry: one shape representation for every tab --------------------------

export type DrawablePoint = { x: number; y: number }

/**
 * A point on a pressure stroke — `t` (ms from stroke start) and `w` (width) drive
 * the signature write-on; absent on plain outline points.
 */
export type StrokePoint = DrawablePoint & { t?: number; w?: number }

export type RibbonStrokeStyle = {
  cap?: 'round' | 'butt' | 'square'
  join?: 'round' | 'bevel' | 'miter'
  taper?: {
    start?: number
    end?: number
  }
}

export type GeometryPrimitive =
  | { kind: 'closed'; points: DrawablePoint[] } // single closed loop (mask / cursor outline)
  | { kind: 'open'; points: DrawablePoint[] } // non-closed polyline (draw-on / guide stroke)
  | { kind: 'multi'; groups: DrawablePoint[][] } // N closed loops (burst / viewfinder corners)
  | { kind: 'ribbon'; strokes: StrokePoint[][]; style?: RibbonStrokeStyle } // ordered pressure strokes (write-on)

export type DrawableMotionStyle =
  | 'auto'
  | 'shape'
  | 'write-on'
  | 'pieces'
  | 'transform'
  | 'shader'

// ---- Shader / material passes --------------------------------------------------

/**
 * Hand-drawn edge texture. Mirrors `HandDrawnMorphEdgeStyle` in the effects engine;
 * Stage 2 makes that type an alias of this one so there is a single source.
 */
export type EdgeShaderConfig = {
  intensity: number
  wobble: number
  tooth: number
  breakup: number
  shortMarks: number
  rake: number
  flecks: number
  speckles: number
  grain: number
  fineFibers: number
  erosion: number
  clustering: number
  detailScale: number
  /** Multiplier for outward contour drift. */
  outerEdge: number
  /** Multiplier for inward abrasion/bite along the silhouette. */
  innerEdge: number
  /** Extra inward nibble at tight turns/corners. */
  cornerBite: number
  /** Expands loose flecks, specks, and short marks beyond the contour. */
  inkBleed: number
  /** Visible boundary stroke weight layered over the rough silhouette. */
  edgeWeight: number
  /** Probability of skipped edge marks/dashes for dry media. */
  dryBrush: number
  /** Global fiber direction, in degrees, blended into edge marks. */
  fiberAngle: number
  /** How strongly edge marks follow the global fiber direction. */
  fiberFlow: number
  /** Size of clustered mark regions along the contour. */
  clusterScale: number
  /** Multiplier for temporal redraw seed movement. */
  boilAmount: number
  /** Quantized redraw rate for living edge / shading jitter. 0 = still. */
  jitterFps?: number
  /** Inherited redraw divisor from scene/tab FPS. 1 = full, 2 = half, 4 = quarter. */
  fpsDivisor?: 1 | 2 | 4
}

export type ImageFillConfig = {
  href: string
  x?: number
  y?: number
  width?: number
  height?: number
  preserveAspectRatio?: string
}

/** The fill body of a layer plus optional material noise over it. */
export type FillShaderConfig = {
  fill?: string
  image?: ImageFillConfig
  stroke?: string
  strokeWidth?: number
  opacity?: number
  glass?: boolean
  glassTint?: string
  /** Material grain dusted across the fill body (0 = none). New in Stage 2. */
  grain?: number
  /** Parallel hatching lines over the fill, or null for none. New in Stage 2. */
  hatching?: { angle: number; spacing: number; weight: number } | null
}

export type AutoShadeBalanceConfig = {
  enabled?: boolean
  /** Desired shadow share of the form, before overlap/separation rules. */
  shadowCoverage?: number
  /** Desired highlight share. If omitted, the complement of shadowCoverage is used. */
  highlightCoverage?: number
  /** Allows shadow/highlight fields to blend into each other instead of strictly partitioning the form. */
  overlap?: number
  /** Reserves neutral space between shadow and highlight fields. */
  separation?: number
  /** Blends shade behavior toward contour-aware wrapping for curved/complex 2D forms. */
  curvedFormBias?: number
}

export type InnerShaderMarkStyle = 'halftone' | 'dots' | 'stipple' | 'hatch' | 'cross' | 'grain' | 'scratch' | 'flow' | 'dry'

export type InnerShaderMarkPopulation = [style: InnerShaderMarkStyle, density?: number, size?: number]
export type InnerShaderPassRole = 'core-shadow' | 'rim-light' | 'tone-zone' | 'ambient-contour' | 'contact-shadow' | 'cast-shadow'
export type InnerShaderPassFieldInputs = {
  /** Relative source layer for this pass. `1` means the next layer casts onto this receiver. */
  sourceLayerOffset?: number
  /** Projected source contour offset in scene coordinates. */
  offsetX?: number
  offsetY?: number
}

export type InnerShaderPassConfig = {
  angle: number
  /** Inward distance of the shade/highlight band from the silhouette. */
  offset: number
  intensity: number
  style?: InnerShaderMarkStyle
  /** Width of the shade/highlight band across the form. */
  spread?: number
  /** Falloff sharpness around the offset shade band. Higher = tighter. */
  edgeBias?: number
  /** Texture scale for dots/hatching. */
  textureScale?: number
  /** Per-frame texture displacement, driven by the edge jitter frame. */
  jitter?: number
  /** Blend hatch direction toward the nearest silhouette tangent. */
  contourAlign?: number
  /** Shrink/expand the active tonal side of the form. */
  coverage?: number
  /** Extra wrap around the contour edge, for form-hugging rim tone. */
  rim?: number
  /** Quantized tonal stepping, for hand-shaded/cel-like bands. */
  banding?: number
  /** Organic displacement of the shading field before contour lookup. */
  warp?: number
  /** Distance-field depth multiplier for the active shade band. */
  fieldDepth?: number
  /** Signed shift of the shade field relative to the contour. Positive pushes inward. */
  fieldOffset?: number
  /** Which side of the contour this pass may sample. Defaults to inside. */
  fieldSide?: 'inside' | 'outside' | 'both'
  /** Smoothness of distance falloff from the contour. */
  fieldSoftness?: number
  /** Tonal remap contrast inside the field. */
  fieldContrast?: number
  /** Extra texture density near the silhouette. */
  densityEdge?: number
  /** How strongly marks get sparser as the shade field fades. */
  densityFalloff?: number
  /** How strongly dots/marks shrink as the shade field fades. */
  sizeFalloff?: number
  /** How softly the lit/shaded band feathers along the contour length. */
  lengthFalloff?: number
  /** Softens tight-corner shade stamping without changing the actual contour. */
  cornerSmoothing?: number
  /** Keeps directional shade ends clipped/stamped instead of feathered. */
  hardStop?: boolean
  /** Layered mark populations inside this single shade pass. */
  markSet?: InnerShaderMarkPopulation[]
  /** State-keyed mark multipliers. Values interpolate from 1 at rest. */
  markState?: Record<string, number>
}

export type InnerShaderPipelinePass = InnerShaderPassConfig & {
  /** Stable authored pass id; used by the runtime field-cache contract. */
  id: string
  /** Lighting role for authoring and future renderer passes. */
  role: InnerShaderPassRole
  /** True for light marks, false for dark marks. */
  lit: boolean
  /** Declared upper bound for this pass's generated procedural marks. */
  markBudget: number
  /** Deterministic offset from the layer render seed. */
  seedOffset?: number
  /** Declares which contour field this pass samples before mark rendering. */
  fieldInputs?: InnerShaderPassFieldInputs
  /** Optional authored cache-key label; generated when omitted. */
  cacheKeyContribution?: string
}

/**
 * Inner shading passes — depth that lives inside the silhouette. Generalises the
 * Animate preview's offset shadow + edge highlight.
 */
export type InnerShaderConfig = {
  innerShadow?: InnerShaderPassConfig | null
  highlight?: InnerShaderPassConfig | null
  /** Ordered authored shading pipeline. When present, it replaces legacy shadow/highlight rendering. */
  shadePasses?: InnerShaderPipelinePass[]
  /** Number of discrete shade bands, or null for smooth/none. */
  shadeBands?: number | null
  /**
   * Optional high-level linked shading mode. When enabled, shadow/highlight share
   * one form budget so one pass can limit, overlap, or separate from the other.
   */
  autoBalance?: AutoShadeBalanceConfig | null
}

// ---- State engine + motion: hover / press / scroll / idle + transforms --------

export type MotionTrigger =
  | 'rest'
  | 'hover'
  | 'hover-on'
  | 'hover-off'
  | 'press'
  | 'release'
  | 'click'
  | 'inView'
  | 'in-view'
  | 'scroll-past'
  | 'proximity'
  | 'idle'
  | 'on-arrive'
  | 'scrub'

export type DrawableStateDefinition = {
  label?: string
  kind?: 'rest' | 'hover' | 'press' | 'variant' | 'pose' | string
  meta?: Record<string, unknown>
}

export type MotionInterruptMode = 'restart' | 'continue' | 'queue' | 'ignore'

export type DrawableStateTransition = {
  id?: string
  from?: string | '*'
  to: string
  trigger: MotionTrigger | string
  durationMs?: number
  easing?: string
  /** Stepped playback frame-rate for gesture transitions (omit = scene/global). */
  fps?: number
  /** Inherited playback divisor from scene/tab FPS. 1 = full, 2 = half, 4 = quarter. */
  fpsDivisor?: 1 | 2 | 4
  delayMs?: number
  /** Wait after arriving before an automatic return transition can start. */
  holdMs?: number
  /** Target for an automatic return; defaults to the scene entry/rest state. */
  returnTo?: string
  /** Wait after the release/hover-off trigger before returning. */
  returnDelayMs?: number
  /** Separate timing for the return leg. */
  returnDurationMs?: number
  /** How a fresh trigger behaves while another transition is active. */
  interrupt?: MotionInterruptMode
  idleMs?: number
  atScrollPx?: number
  style?: DrawableMotionStyle | string
  layer?: string
  disabled?: boolean
  reason?: string
  conditions?: Array<{ channel?: string; field?: string; op?: string; value?: unknown }>
  actions?: Array<{ type: string; trigger?: string; controllerId?: string; value?: unknown }>
}

export type DrawableStateScrubConfig = {
  source: 'element' | 'page' | 'section'
  /** Ordered state/pose ids driven by scroll progress. */
  track?: string[]
  startId?: string
  endId?: string
  startPx?: number
  endPx?: number
  easing?: string
  smoothing?: number
  direction?: 'normal' | 'reverse'
  shimmer?: boolean
}

export type DrawableCompositionConfig = {
  /**
   * Renders the host-controlled scrub as the base pose, then applies gesture
   * deltas additively so hover/click can layer over moving scroll progress.
   */
  mode: 'scrub-additive-overlays'
}

export type DrawableProximityConfig = {
  radius?: number
  target?: string
  falloff?: 'linear' | 'smooth' | 'spring' | string
}

export type DrawableStateGraphLayer = {
  id: string
  label?: string
  priority?: number
  states?: Record<string, DrawableStateDefinition>
  transitions?: DrawableStateTransition[]
  disabled?: boolean
  reason?: string
}

export type DrawableStateGraphListener = {
  id?: string
  target?: string
  listenTo: string
  action: 'send-trigger' | 'set-controller' | string
  trigger?: string
  controllerId?: string
  value?: unknown
  disabled?: boolean
}

export type DrawableStateGraph = {
  entry?: string
  states?: Record<string, DrawableStateDefinition>
  transitions?: DrawableStateTransition[]
  layers?: DrawableStateGraphLayer[]
  listeners?: DrawableStateGraphListener[]
  meta?: Record<string, unknown>
}

export type MotionPrimitiveConfig = {
  /** What fires this motion. String-open for custom triggers a scene may define. */
  trigger: MotionTrigger | string
  /** Target state id this motion drives toward, or '@return' to fall back to rest. */
  to: string
  durationMs: number
  easing: string
  /** Rendering primitive used for this motion; `write-on` reveals stroke/ribbon geometry over time. */
  style?: DrawableMotionStyle | string
  /** Stepped playback frame-rate for the hand-drawn boil feel (omit = smooth). */
  fps?: number
  /** Inherited playback divisor from scene/tab FPS. 1 = full, 2 = half, 4 = quarter. */
  fpsDivisor?: 1 | 2 | 4
  /** Per-layer stagger before this motion starts. */
  delayMs?: number
  /** Wait after arriving before an automatic return transition can start. */
  holdMs?: number
  /** Target for an automatic return; defaults to the scene entry/rest state. */
  returnTo?: string
  /** Wait after the release/hover-off trigger before returning. */
  returnDelayMs?: number
  /** Separate timing for the return leg. */
  returnDurationMs?: number
  /** How a fresh trigger behaves while another transition is active. */
  interrupt?: MotionInterruptMode
  /** Rigid group transform (the burst / collapse choreography). */
  transform?: { tx?: number; ty?: number; scale?: number; rotate?: number }
  /** Scroll-linked scrub source, when `trigger` is 'scrub'. */
  scrub?: DrawableStateScrubConfig
}

export type DrawableLayerTransform = {
  /** Translate the rendered layer in scene/viewBox units. */
  tx?: number
  ty?: number
  /** Uniform scale applied around `origin` when provided. */
  scale?: number
  /** Rotation in degrees, applied around `origin` when provided. */
  rotate?: number
  /** Scene/viewBox point used as the transform pivot. Defaults to the SVG origin. */
  origin?: DrawablePoint
}

// ---- The drawable model --------------------------------------------------------

export type DrawableLayer = {
  /** Stable id; z-order is the array index in the scene's `layers`. */
  id: string
  name?: string
  geometry: GeometryPrimitive
  /** Resample resolution for this layer's geometry (mask ~180, cursor 120, …). */
  resolution?: number
  /** Smoothing tension for the rendered path (0 = polygonal). */
  smoothing?: number
  /**
   * Cheap rigid layer movement applied after the expensive contour/shader render.
   * Use this for wind, rustle, hover drift, and grouped motion that should not
   * force rough edges or shade marks to regenerate every frame.
   */
  transform?: DrawableLayerTransform
  edge?: EdgeShaderConfig
  fill?: FillShaderConfig
  inner?: InnerShaderConfig
  passes?: {
    fill?: boolean
    edge?: boolean
    innerShadow?: boolean
    highlight?: boolean
    grain?: boolean
    hatching?: boolean
  }
  /**
   * Alternate geometries this layer morphs between (poses / cursor states), keyed by
   * state id; the live one is chosen by motion.
   */
  states?: Record<string, GeometryPrimitive>
  motion?: MotionPrimitiveConfig[]
  /** Cursor hot-spot, in the scene's viewBox coordinates. */
  anchor?: DrawablePoint
}

export type DrawableSceneKind = 'mask' | 'cursor' | 'sign' | 'animate'

export type DrawableScene = {
  id: string
  /** Origin tab → which publish channel this scene belongs to. */
  kind: DrawableSceneKind
  viewBox: [number, number]
  layers: DrawableLayer[]
  /** Resting state id. */
  entry?: string
  /** Shared state graph consumed by the pure state engine. */
  states?: Record<string, DrawableStateDefinition>
  transitions?: DrawableStateTransition[]
  stateGraph?: DrawableStateGraph
  scrub?: DrawableStateScrubConfig
  composition?: DrawableCompositionConfig
  proximity?: DrawableProximityConfig
  /** Default target for '@return' transitions; usually the entry state. */
  returnTarget?: string
  /** Scene-level / group motion applied across all layers. */
  motion?: MotionPrimitiveConfig[]
  meta?: Record<string, unknown>
}
