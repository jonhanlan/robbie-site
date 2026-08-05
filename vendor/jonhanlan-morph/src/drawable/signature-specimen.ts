import type { MorphRuntimeBoilModeV0, MorphRuntimeReducedMotionFallbackV0 } from './runtime-contract'
import type { DrawableLayer, DrawablePoint, DrawableScene, EdgeShaderConfig, InnerShaderConfig, InnerShaderMarkStyle, StrokePoint } from './types'

export type SignatureDataset = {
  version?: number
  duration?: number
  ease?: string
  viewBox?: [number, number]
  states?: SignatureStateProfile
  motion?: SignatureMotionProfile
  settings?: SignatureRuntimeSettingsProfile
  render?: SignatureRenderProfile
  layers?: SignatureAuthoringLayer[]
  strokes?: Array<{
    layerId?: string
    points?: StrokePoint[]
  }>
}

export type SignatureAuthoringLayer = {
  id: string
  name: string
  visible: boolean
  look?: SignatureLayerLookProfile
}

export type SignatureLayerLookProfile = {
  fill?: string
  opacity?: number
  edgeTooth?: number
  edgeWobble?: number
  shadeShadowIntensity?: number
  shadeHighlightIntensity?: number
  shadeMarkStyle?: InnerShaderMarkStyle
}

export type SignatureStateProfile = Record<string, Partial<SignatureStateTransform> | undefined> & {
  hover?: Partial<SignatureStateTransform>
  press?: Partial<SignatureStateTransform>
}

export type SignatureStateTransform = {
  scaleX: number
  scaleY: number
  offsetY: number
  wave: number
  drift: number
}

export type SignatureMotionProfile = {
  hoverDurationMs?: number
  hoverOffDurationMs?: number
  hoverOffDelayMs?: number
  pressDurationMs?: number
  releaseDurationMs?: number
  easing?: string
  pressEasing?: string
  fps?: number
  reducedMotion?: MorphRuntimeReducedMotionFallbackV0
}

export type SignatureRuntimeSettingsProfile = {
  boil?: MorphRuntimeBoilModeV0
}

export type SignatureRenderProfile = {
  fill?: string
  opacity?: number
  smoothing?: number
  edge?: Partial<EdgeShaderConfig>
  shade?: Partial<SignatureShadeProfile>
}

export type SignatureShadeProfile = {
  shadowIntensity: number
  highlightIntensity: number
  markStyle: InnerShaderMarkStyle
  contourAlign: number
  textureScale: number
  fieldSoftness: number
}

type ResolvedSignatureRenderProfile = {
  fill: string
  opacity: number
  smoothing: number
  edge: EdgeShaderConfig
  shade: SignatureShadeProfile
}

export type DrawableSignatureRibbonBaselineV0 = {
  schema: 'morph-signature-ribbon-baseline/v0'
  version: 0
  storageKey: typeof SIGNATURE_STORAGE_KEY
  sourceDataset: typeof SIGNATURE_EXPORTED_DATASET_KEY
  rendererStatus: 'baseline-only'
  closedOutline: {
    scene: DrawableScene
    layerCount: number
    pointCount: number
  }
  ribbonCandidate: {
    scene: DrawableScene
    layerCount: number
    pointCount: number
    pressurePointCount: number
  }
}

export type DrawableSignaturePathMorphProofV0 = {
  schema: 'morph-signature-path-morph-proof/v0'
  version: 0
  storageKey: typeof SIGNATURE_STORAGE_KEY
  sourceDataset: typeof SIGNATURE_EXPORTED_DATASET_KEY
  rendererStatus: 'path-morph-proof'
  scene: DrawableScene
  layerCount: number
  restPointCount: number
  targetPointCount: number
}

const SIGNATURE_STORAGE_KEY = 'signature'
const SIGNATURE_SCENE_ID = 'jonhanlan-signature'
const SIGNATURE_EXPORTED_DATASET_KEY = 'signature'
const DEFAULT_VIEW_BOX: [number, number] = [300, 100]
const OUTLINE_DECIMALS = 2
type ResolvedSignatureMotionProfile = Required<Omit<SignatureMotionProfile, 'reducedMotion'>>

const DEFAULT_SIGNATURE_MOTION: ResolvedSignatureMotionProfile = {
  hoverDurationMs: 260,
  hoverOffDurationMs: 360,
  hoverOffDelayMs: 80,
  pressDurationMs: 120,
  releaseDurationMs: 180,
  easing: 'smoothstep',
  pressEasing: 'ease-out',
  fps: 30,
}
const DEFAULT_SIGNATURE_STATES: Record<'hover' | 'press', SignatureStateTransform> = {
  hover: {
    scaleX: 1.012,
    scaleY: 1.025,
    offsetY: -1.2,
    wave: 0.32,
    drift: 0.22,
  },
  press: {
    scaleX: 0.997,
    scaleY: 0.93,
    offsetY: 2.4,
    wave: 0.16,
    drift: 0.1,
  },
}
const IDENTITY_SIGNATURE_STATE: SignatureStateTransform = {
  scaleX: 1,
  scaleY: 1,
  offsetY: 0,
  wave: 0,
  drift: 0,
}
const DEFAULT_SIGNATURE_RENDER: ResolvedSignatureRenderProfile = {
  fill: '#161616',
  opacity: 0.96,
  smoothing: 0.58,
  edge: {
    intensity: 1.1,
    wobble: 0.06,
    tooth: 0.22,
    breakup: 0.1,
    shortMarks: 0.02,
    rake: 0,
    flecks: 0.02,
    speckles: 0.02,
    grain: 0,
    fineFibers: 0,
    erosion: 0.04,
    clustering: 0.08,
    detailScale: 0.52,
    outerEdge: 0.5,
    innerEdge: 0.2,
    cornerBite: 0.06,
    inkBleed: 0.04,
    edgeWeight: 0.28,
    dryBrush: 0.12,
    fiberAngle: -12,
    fiberFlow: 0.12,
    clusterScale: 0.7,
    boilAmount: 0.18,
    jitterFps: 0,
  },
  shade: {
    shadowIntensity: 0,
    highlightIntensity: 0,
    markStyle: 'halftone',
    contourAlign: 0.78,
    textureScale: 0.95,
    fieldSoftness: 0.8,
  },
}
const SIGNATURE_SHADE_MARK_STYLES: InnerShaderMarkStyle[] = ['halftone', 'dots', 'stipple', 'hatch', 'cross', 'grain', 'scratch', 'flow', 'dry']

export const drawableSignatureRuntimeStorageKeyV0 = SIGNATURE_STORAGE_KEY

export function createDrawableSignatureRuntimeScene(
  dataset: SignatureDataset = {},
): DrawableScene {
  const viewBox = validViewBox(dataset.viewBox) ? dataset.viewBox : DEFAULT_VIEW_BOX
  const states = signatureStateProfile(dataset.states)
  const motion = signatureMotionProfile(dataset.motion)
  const render = signatureRenderProfile(dataset.render)
  const centre = { x: viewBox[0] / 2, y: viewBox[1] / 2 }
  const layers = (dataset.strokes ?? [])
    .map((stroke, index) => signatureStrokeLayer(stroke.points ?? [], index, centre, states, render))
    .filter((layer): layer is DrawableLayer => layer !== null)

  const stateDefinitions = signatureStateDefinitions(states)
  return {
    id: SIGNATURE_SCENE_ID,
    kind: 'sign',
    viewBox,
    entry: 'rest',
    states: stateDefinitions,
    stateGraph: {
      entry: 'rest',
      states: stateDefinitions,
      transitions: [
        {
          from: '*',
          to: 'hover',
          trigger: 'hover-on',
          durationMs: motion.hoverDurationMs,
          easing: motion.easing,
          fps: motion.fps,
          interrupt: 'restart',
        },
        {
          from: '*',
          to: 'rest',
          trigger: 'hover-off',
          durationMs: motion.hoverOffDurationMs,
          delayMs: motion.hoverOffDelayMs,
          easing: motion.easing,
          fps: motion.fps,
          interrupt: 'restart',
        },
        {
          from: '*',
          to: 'press',
          trigger: 'press',
          durationMs: motion.pressDurationMs,
          easing: motion.pressEasing,
          fps: motion.fps,
          interrupt: 'restart',
        },
        {
          from: 'press',
          to: 'hover',
          trigger: 'release',
          durationMs: motion.releaseDurationMs,
          easing: motion.easing,
          fps: motion.fps,
          interrupt: 'restart',
        },
      ],
    },
    layers,
    meta: {
      title: 'Jon Hanlan signature',
      sourceDataset: SIGNATURE_EXPORTED_DATASET_KEY,
      datasetVersion: dataset.version ?? 0,
    },
  }
}

export function signatureStateProfile(profile: SignatureStateProfile | undefined): Record<string, SignatureStateTransform> {
  const states: Record<string, SignatureStateTransform> = {
    hover: cleanStateTransform(profile?.hover, DEFAULT_SIGNATURE_STATES.hover),
    press: cleanStateTransform(profile?.press, DEFAULT_SIGNATURE_STATES.press),
  }
  for (const id of Object.keys(profile ?? {}).sort()) {
    if (id === 'hover' || id === 'press') continue
    states[id] = cleanStateTransform(profile?.[id], IDENTITY_SIGNATURE_STATE)
  }
  return states
}

function signatureStateDefinitions(states: Record<string, SignatureStateTransform>): NonNullable<DrawableScene['states']> {
  const definitions: NonNullable<DrawableScene['states']> = {
    rest: { kind: 'rest', label: 'Rest' },
    hover: { kind: 'hover', label: 'Hover' },
    press: { kind: 'press', label: 'Press' },
  }
  for (const id of Object.keys(states)) {
    if (id === 'hover' || id === 'press' || id === 'rest') continue
    definitions[id] = { kind: 'variant', label: humanizeStateID(id) }
  }
  return definitions
}

function humanizeStateID(id: string): string {
  return id
    .replace(/([a-z0-9])([A-Z])/gu, '$1 $2')
    .replace(/[-_]+/gu, ' ')
    .replace(/\b\w/gu, (character) => character.toUpperCase())
}

export function signatureMotionProfile(profile: SignatureMotionProfile | undefined): ResolvedSignatureMotionProfile {
  return {
    hoverDurationMs: cleanDuration(profile?.hoverDurationMs, DEFAULT_SIGNATURE_MOTION.hoverDurationMs),
    hoverOffDurationMs: cleanDuration(profile?.hoverOffDurationMs, DEFAULT_SIGNATURE_MOTION.hoverOffDurationMs),
    hoverOffDelayMs: cleanDuration(profile?.hoverOffDelayMs, DEFAULT_SIGNATURE_MOTION.hoverOffDelayMs),
    pressDurationMs: cleanDuration(profile?.pressDurationMs, DEFAULT_SIGNATURE_MOTION.pressDurationMs),
    releaseDurationMs: cleanDuration(profile?.releaseDurationMs, DEFAULT_SIGNATURE_MOTION.releaseDurationMs),
    easing: cleanEasing(profile?.easing, DEFAULT_SIGNATURE_MOTION.easing),
    pressEasing: cleanEasing(profile?.pressEasing, DEFAULT_SIGNATURE_MOTION.pressEasing),
    fps: cleanFps(profile?.fps, DEFAULT_SIGNATURE_MOTION.fps),
  }
}

export function signatureRenderProfile(profile: SignatureRenderProfile | undefined): ResolvedSignatureRenderProfile {
  return {
    fill: cleanColor(profile?.fill, DEFAULT_SIGNATURE_RENDER.fill),
    opacity: cleanUnit(profile?.opacity, DEFAULT_SIGNATURE_RENDER.opacity),
    smoothing: cleanUnit(profile?.smoothing, DEFAULT_SIGNATURE_RENDER.smoothing),
    edge: {
      ...DEFAULT_SIGNATURE_RENDER.edge,
      ...cleanEdge(profile?.edge),
    },
    shade: cleanShade(profile?.shade),
  }
}

function cleanStateTransform(
  transform: Partial<SignatureStateTransform> | undefined,
  fallback: SignatureStateTransform,
): SignatureStateTransform {
  return {
    scaleX: cleanSignedNumber(transform?.scaleX, fallback.scaleX),
    scaleY: cleanSignedNumber(transform?.scaleY, fallback.scaleY),
    offsetY: cleanSignedNumber(transform?.offsetY, fallback.offsetY),
    wave: cleanSignedNumber(transform?.wave, fallback.wave),
    drift: cleanSignedNumber(transform?.drift, fallback.drift),
  }
}

function cleanDuration(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : fallback
}

function cleanFps(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : fallback
}

function cleanSignedNumber(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.round(numeric * 1000) / 1000 : fallback
}

function cleanEasing(value: unknown, fallback: string): string {
  const easing = typeof value === 'string' ? value.trim() : ''
  return easing || fallback
}

function cleanColor(value: unknown, fallback: string): string {
  const color = typeof value === 'string' ? value.trim() : ''
  return /^#[0-9a-f]{6}$/iu.test(color) ? color.toLowerCase() : fallback
}

function cleanUnit(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(0, Math.min(1, Math.round(numeric * 1000) / 1000)) : fallback
}

function cleanEdge(edge: SignatureRenderProfile['edge'] | undefined): Partial<EdgeShaderConfig> {
  if (!edge || typeof edge !== 'object') return {}
  const cleaned: Partial<EdgeShaderConfig> = {}
  for (const key of Object.keys(DEFAULT_SIGNATURE_RENDER.edge) as Array<keyof EdgeShaderConfig>) {
    if (key === 'fiberAngle') continue
    const value = edge[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    cleaned[key] = Math.max(0, Math.round(value * 1000) / 1000) as never
  }
  return cleaned
}

function cleanShade(shade: SignatureRenderProfile['shade'] | undefined): SignatureShadeProfile {
  return {
    shadowIntensity: cleanRange(shade?.shadowIntensity, DEFAULT_SIGNATURE_RENDER.shade.shadowIntensity, 0, 0.9),
    highlightIntensity: cleanRange(shade?.highlightIntensity, DEFAULT_SIGNATURE_RENDER.shade.highlightIntensity, 0, 0.9),
    markStyle: cleanShadeMarkStyle(shade?.markStyle),
    contourAlign: cleanRange(shade?.contourAlign, DEFAULT_SIGNATURE_RENDER.shade.contourAlign, 0, 1),
    textureScale: cleanRange(shade?.textureScale, DEFAULT_SIGNATURE_RENDER.shade.textureScale, 0.35, 2.5),
    fieldSoftness: cleanRange(shade?.fieldSoftness, DEFAULT_SIGNATURE_RENDER.shade.fieldSoftness, 0, 1),
  }
}

function cleanRange(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(min, Math.min(max, Math.round(numeric * 1000) / 1000)) : fallback
}

function cleanShadeMarkStyle(value: unknown): InnerShaderMarkStyle {
  return SIGNATURE_SHADE_MARK_STYLES.includes(value as InnerShaderMarkStyle)
    ? value as InnerShaderMarkStyle
    : DEFAULT_SIGNATURE_RENDER.shade.markStyle
}

export function createDrawableSignatureRibbonBaselineV0(
  dataset: SignatureDataset = {},
): DrawableSignatureRibbonBaselineV0 {
  const closedOutlineScene = createDrawableSignatureRuntimeScene(dataset)
  const viewBox = validViewBox(dataset.viewBox) ? dataset.viewBox : DEFAULT_VIEW_BOX
  const states = signatureStateProfile(dataset.states)
  const render = signatureRenderProfile(dataset.render)
  const centre = { x: viewBox[0] / 2, y: viewBox[1] / 2 }
  const ribbonLayers = (dataset.strokes ?? [])
    .map((stroke, index) => signatureRibbonLayer(stroke.points ?? [], index, centre, states, render))
    .filter((layer): layer is DrawableLayer => layer !== null)
  const ribbonScene: DrawableScene = {
    ...closedOutlineScene,
    id: `${SIGNATURE_SCENE_ID}-ribbon-baseline`,
    layers: ribbonLayers,
    meta: {
      ...closedOutlineScene.meta,
      title: 'Jon Hanlan signature ribbon baseline',
      rendererStatus: 'baseline-only',
      compareAgainst: SIGNATURE_STORAGE_KEY,
      ...(ribbonLayers.length === 0 ? { authoringBlank: true } : {}),
    },
  }

  return {
    schema: 'morph-signature-ribbon-baseline/v0',
    version: 0,
    storageKey: SIGNATURE_STORAGE_KEY,
    sourceDataset: SIGNATURE_EXPORTED_DATASET_KEY,
    rendererStatus: 'baseline-only',
    closedOutline: {
      scene: closedOutlineScene,
      layerCount: closedOutlineScene.layers.length,
      pointCount: countScenePoints(closedOutlineScene),
    },
    ribbonCandidate: {
      scene: ribbonScene,
      layerCount: ribbonScene.layers.length,
      pointCount: countScenePoints(ribbonScene),
      pressurePointCount: countScenePressurePoints(ribbonScene),
    },
  }
}

export function createDrawableSignaturePathMorphProofV0(
  dataset: SignatureDataset = {},
): DrawableSignaturePathMorphProofV0 {
  const signatureScene = createDrawableSignatureRuntimeScene(dataset)
  const pathMorphScene: DrawableScene = {
    ...signatureScene,
    id: `${SIGNATURE_SCENE_ID}-path-morph-proof`,
    layers: signatureScene.layers
      .map((layer, index) => signaturePathMorphLayer(layer, index))
      .filter((layer): layer is DrawableLayer => layer !== null),
    meta: {
      ...signatureScene.meta,
      title: 'Jon Hanlan signature path morph proof',
      rendererStatus: 'path-morph-proof',
      compareAgainst: SIGNATURE_STORAGE_KEY,
    },
  }

  return {
    schema: 'morph-signature-path-morph-proof/v0',
    version: 0,
    storageKey: SIGNATURE_STORAGE_KEY,
    sourceDataset: SIGNATURE_EXPORTED_DATASET_KEY,
    rendererStatus: 'path-morph-proof',
    scene: pathMorphScene,
    layerCount: pathMorphScene.layers.length,
    restPointCount: countScenePoints(pathMorphScene),
    targetPointCount: pathMorphScene.layers.reduce((sum, layer) => {
      const hover = layer.states?.hover
      return sum + (hover?.kind === 'closed' ? hover.points.length : 0)
    }, 0),
  }
}

function signaturePathMorphLayer(layer: DrawableLayer, index: number): DrawableLayer | null {
  if (layer.geometry.kind !== 'closed') return null
  const hover = layer.geometry
  const press = layer.states?.press?.kind === 'closed' ? layer.states.press : hover
  const seed = signaturePathMorphSeedOutline(hover.points, index)
  if (seed.length < 3) return null

  return {
    ...layer,
    id: `signature-path-morph-${index + 1}`,
    geometry: {
      kind: 'closed',
      points: seed,
    },
    states: {
      hover: {
        kind: 'closed',
        points: hover.points.map(clonePoint),
      },
      press: {
        kind: 'closed',
        points: press.points.map(clonePoint),
      },
    },
    resolution: Math.max(seed.length, hover.points.length, press.points.length),
    fill: {
      fill: pathMorphProofFill(layer.fill?.fill),
      opacity: Math.max(0.72, Math.min(1, layer.fill?.opacity ?? 0.94)),
    },
  }
}

function signaturePathMorphSeedOutline(points: DrawablePoint[], index: number): DrawablePoint[] {
  const bounds = pointBounds(points)
  const centre = {
    x: round((bounds.minX + bounds.maxX) / 2),
    y: round((bounds.minY + bounds.maxY) / 2),
  }
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 1)
  const radius = Math.max(5.5, Math.min(14, span * 0.18))
  const pointCount = 12 + (index % 2) * 4
  const phase = index * 0.37
  const outline: DrawablePoint[] = []
  for (let step = 0; step < pointCount; step += 1) {
    const angle = phase + (Math.PI * 2 * step) / pointCount
    outline.push({
      x: round(centre.x + Math.cos(angle) * radius),
      y: round(centre.y + Math.sin(angle) * radius * 0.82),
    })
  }
  return outline
}

function pointBounds(points: DrawablePoint[]) {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  for (const point of points) {
    minX = Math.min(minX, point.x)
    minY = Math.min(minY, point.y)
    maxX = Math.max(maxX, point.x)
    maxY = Math.max(maxY, point.y)
  }
  return { minX, minY, maxX, maxY }
}

function clonePoint(point: DrawablePoint): DrawablePoint {
  return { x: point.x, y: point.y }
}

function pathMorphProofFill(fill: string | undefined): string {
  return fill === '#161616' || fill === '#000000' || fill == null ? '#f2eee3' : fill
}

function signatureStrokeLayer(
  points: StrokePoint[],
  index: number,
  centre: DrawablePoint,
  states: Record<string, SignatureStateTransform>,
  render: ResolvedSignatureRenderProfile,
): DrawableLayer | null {
  const sampled = resampleStroke(cleanStroke(points), resampleCount(points))
  if (sampled.length < 2) return null

  const rest = strokeOutline(sampled)
  if (rest.length < 3) return null
  const inner = signatureInnerShade(render.shade)

  return {
    id: `signature-stroke-${index + 1}`,
    geometry: {
      kind: 'closed',
      points: rest,
    },
    states: Object.fromEntries(Object.entries(states).map(([id, state]) => [id, {
      kind: 'closed' as const,
      points: transformOutline(rest, index, centre, state),
    }])),
    resolution: rest.length,
    smoothing: render.smoothing,
    edge: signatureEdge(index, render.edge),
    fill: {
      fill: render.fill,
      opacity: render.opacity,
    },
    ...(inner ? { inner } : {}),
    passes: {
      fill: true,
      edge: true,
      innerShadow: Boolean(inner?.innerShadow),
      highlight: Boolean(inner?.highlight),
      grain: false,
      hatching: false,
    },
  }
}

function signatureRibbonLayer(
  points: StrokePoint[],
  index: number,
  centre: DrawablePoint,
  states: Record<string, SignatureStateTransform>,
  render: ResolvedSignatureRenderProfile,
): DrawableLayer | null {
  const sampled = smoothRibbonPressure(resampleStroke(cleanStroke(points), ribbonResampleCount(points)))
  if (sampled.length < 2) return null
  const inner = signatureInnerShade(render.shade)

  return {
    id: `signature-ribbon-${index + 1}`,
    geometry: {
      kind: 'ribbon',
      strokes: [sampled],
      style: {
        cap: 'round',
        join: 'round',
        taper: {
          start: 0.18,
          end: 0.16,
        },
      },
    },
    states: Object.fromEntries(Object.entries(states).map(([id, state]) => [id, {
      kind: 'ribbon' as const,
      strokes: [transformRibbonStroke(sampled, index, centre, state)],
    }])),
    resolution: sampled.length,
    smoothing: render.smoothing,
    edge: signatureEdge(index, render.edge),
    fill: {
      fill: render.fill,
      opacity: render.opacity,
    },
    motion: [{
      trigger: 'hover',
      to: 'hover',
      durationMs: 260,
      easing: 'smoothstep',
      style: 'write-on',
      fps: 30,
    }],
    ...(inner ? { inner } : {}),
    passes: {
      fill: true,
      edge: true,
      innerShadow: Boolean(inner?.innerShadow),
      highlight: Boolean(inner?.highlight),
      grain: false,
      hatching: false,
    },
  }
}

export function signatureInnerShade(shade: SignatureShadeProfile): InnerShaderConfig | null {
  const shadowIntensity = shade.shadowIntensity
  const highlightIntensity = shade.highlightIntensity
  if (shadowIntensity <= 0 && highlightIntensity <= 0) return null

  return {
    innerShadow: shadowIntensity > 0 ? {
      angle: 132,
      offset: 12,
      intensity: shadowIntensity,
      style: shade.markStyle,
      spread: 0.46,
      textureScale: shade.textureScale,
      contourAlign: shade.contourAlign,
      coverage: 0.58,
      fieldSoftness: shade.fieldSoftness,
    } : null,
    highlight: highlightIntensity > 0 ? {
      angle: 312,
      offset: 10,
      intensity: highlightIntensity,
      style: shade.markStyle,
      spread: 0.34,
      textureScale: shade.textureScale,
      contourAlign: shade.contourAlign,
      coverage: 0.32,
      fieldSoftness: shade.fieldSoftness,
    } : null,
  }
}

function cleanStroke(points: StrokePoint[]): StrokePoint[] {
  return points
    .filter((point) => finite(point.x) && finite(point.y))
    .map((point) => ({
      x: round(point.x),
      y: round(point.y),
      ...(finite(point.t) ? { t: round(point.t as number, 3) } : {}),
      ...(finite(point.w) ? { w: round(point.w as number, 3) } : {}),
    }))
}

function resampleCount(points: StrokePoint[]): number {
  const total = strokeLength(cleanStroke(points))
  if (total <= 0) return 0
  return Math.max(10, Math.min(24, Math.round(total / 11) + 2))
}

function ribbonResampleCount(points: StrokePoint[]): number {
  const total = strokeLength(cleanStroke(points))
  if (total <= 0) return 0
  return Math.max(12, Math.min(36, Math.round(total / 8) + 2))
}

function resampleStroke(points: StrokePoint[], count: number): StrokePoint[] {
  if (points.length < 2 || count < 2) return points
  const distances = [0]
  for (let index = 1; index < points.length; index += 1) {
    distances[index] = distances[index - 1]! + pointDistance(points[index - 1]!, points[index]!)
  }
  const total = distances[distances.length - 1] ?? 0
  if (total <= 0) return points.slice(0, count)

  const result: StrokePoint[] = []
  let cursor = 1
  for (let index = 0; index < count; index += 1) {
    const target = (total * index) / Math.max(1, count - 1)
    while (cursor < distances.length - 1 && distances[cursor]! < target) cursor += 1
    const leftDistance = distances[cursor - 1] ?? 0
    const rightDistance = distances[cursor] ?? leftDistance
    const span = Math.max(0.0001, rightDistance - leftDistance)
    const local = Math.max(0, Math.min(1, (target - leftDistance) / span))
    const left = points[cursor - 1]!
    const right = points[cursor] ?? left
    result.push({
      x: round(lerp(left.x, right.x, local)),
      y: round(lerp(left.y, right.y, local)),
      ...(finite(left.t) || finite(right.t) ? { t: round(lerp(left.t ?? 0, right.t ?? left.t ?? 0, local), 3) } : {}),
      w: round(lerp(pointWidth(left), pointWidth(right), local), 3),
    })
  }
  return result
}

function smoothRibbonPressure(points: StrokePoint[]): StrokePoint[] {
  if (points.length < 3) return points
  return points.map((point, index) => {
    const previous = points[Math.max(0, index - 1)]!
    const next = points[Math.min(points.length - 1, index + 1)]!
    const weight = index === 0 || index === points.length - 1
      ? pointWidth(point) * 0.75 + pointWidth(index === 0 ? next : previous) * 0.25
      : pointWidth(previous) * 0.25 + pointWidth(point) * 0.5 + pointWidth(next) * 0.25
    return {
      ...point,
      w: round(weight, 3),
    }
  })
}

function strokeOutline(points: StrokePoint[]): DrawablePoint[] {
  const left: DrawablePoint[] = []
  const right: DrawablePoint[] = []

  for (let index = 0; index < points.length; index += 1) {
    const previous = points[Math.max(0, index - 1)]!
    const current = points[index]!
    const next = points[Math.min(points.length - 1, index + 1)]!
    const tangent = normalize({ x: next.x - previous.x, y: next.y - previous.y })
    const normal = { x: -tangent.y, y: tangent.x }
    const halfWidth = Math.max(1.05, Math.min(4.2, pointWidth(current) * 0.55 + 0.4))
    left.push({
      x: round(current.x + normal.x * halfWidth),
      y: round(current.y + normal.y * halfWidth),
    })
    right.push({
      x: round(current.x - normal.x * halfWidth),
      y: round(current.y - normal.y * halfWidth),
    })
  }

  return [...left, ...right.reverse()]
}

function transformOutline(
  points: DrawablePoint[],
  strokeIndex: number,
  centre: DrawablePoint,
  transform: SignatureStateTransform,
): DrawablePoint[] {
  return points.map((point, index) => {
    const wave = Math.sin((index + 1) * 0.83 + strokeIndex * 1.71)
    const drift = Math.cos((index + 1) * 0.49 + strokeIndex * 0.67)
    return {
      x: round(centre.x + (point.x - centre.x) * transform.scaleX + wave * transform.wave),
      y: round(centre.y + (point.y - centre.y) * transform.scaleY + transform.offsetY + drift * transform.drift),
    }
  })
}

function transformRibbonStroke(
  points: StrokePoint[],
  strokeIndex: number,
  centre: DrawablePoint,
  transform: SignatureStateTransform,
): StrokePoint[] {
  return points.map((point, index) => {
    const wave = Math.sin((index + 1) * 0.83 + strokeIndex * 1.71)
    const drift = Math.cos((index + 1) * 0.49 + strokeIndex * 0.67)
    const transformed = {
      x: round(centre.x + (point.x - centre.x) * transform.scaleX + wave * transform.wave),
      y: round(centre.y + (point.y - centre.y) * transform.scaleY + transform.offsetY + drift * transform.drift),
    }
    return {
      x: transformed.x,
      y: transformed.y,
      ...(finite(point.t) ? { t: point.t } : {}),
      ...(finite(point.w) ? { w: point.w } : {}),
    }
  })
}

function signatureEdge(index: number, edge: EdgeShaderConfig = DEFAULT_SIGNATURE_RENDER.edge): EdgeShaderConfig {
  return {
    ...edge,
    fiberAngle: -12 + index * 4,
  }
}

function countScenePoints(scene: DrawableScene): number {
  return scene.layers.reduce((sum, layer) => sum + countGeometryPoints(layer.geometry), 0)
}

function countScenePressurePoints(scene: DrawableScene): number {
  return scene.layers.reduce((sum, layer) => {
    if (layer.geometry.kind !== 'ribbon') return sum
    return sum + layer.geometry.strokes.flat().filter((point) => finite(point.w)).length
  }, 0)
}

function countGeometryPoints(geometry: DrawableLayer['geometry']): number {
  if (geometry.kind === 'closed' || geometry.kind === 'open') return geometry.points.length
  if (geometry.kind === 'multi') return geometry.groups.reduce((sum, group) => sum + group.length, 0)
  return geometry.strokes.reduce((sum, stroke) => sum + stroke.length, 0)
}

function strokeLength(points: DrawablePoint[]): number {
  let total = 0
  for (let index = 1; index < points.length; index += 1) {
    total += pointDistance(points[index - 1]!, points[index]!)
  }
  return total
}

function pointDistance(a: DrawablePoint, b: DrawablePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function pointWidth(point: StrokePoint): number {
  return finite(point.w) ? point.w as number : 2.6
}

function normalize(point: DrawablePoint): DrawablePoint {
  const length = Math.hypot(point.x, point.y)
  if (length <= 0.0001) return { x: 1, y: 0 }
  return { x: point.x / length, y: point.y / length }
}

function validViewBox(value: unknown): value is [number, number] {
  return Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => finite(item) && item > 0)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function round(value: number, digits = OUTLINE_DECIMALS): number {
  return Number(value.toFixed(digits))
}
