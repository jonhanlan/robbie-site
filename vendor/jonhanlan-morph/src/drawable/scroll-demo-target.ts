import scrollDemoCueInViewDatasetJson from '../../exports/datasets/scroll-demo-cue-in-view.json'
import scrollDemoCombinedDatasetJson from '../../exports/datasets/scroll-demo-combined.json'
import scrollDemoHeroDatasetJson from '../../exports/datasets/scroll-demo-hero.json'
import scrollDemoPageDatasetJson from '../../exports/datasets/scroll-demo-page.json'
import scrollDemoScrollPastDatasetJson from '../../exports/datasets/scroll-demo-scroll-past.json'
import scrollDemoTravelDatasetJson from '../../exports/datasets/scroll-demo-travel.json'
import type { DrawableLayer, DrawablePoint, DrawableScene, EdgeShaderConfig, InnerShaderConfig, InnerShaderMarkStyle } from './types'
import type { MorphRuntimeBoilModeV0, MorphRuntimeReducedMotionFallbackV0 } from './runtime-contract'

type ScrollDemoScrubShapeSpec =
  | { kind: 'circle'; radius: number }
  | { kind: 'ellipse'; rx: number; ry: number }
  | { kind: 'star'; outerRadius: number; innerRadius: number; points: number }
  | { kind: 'superShape'; radius: number; power: number }

type ScrollDemoScrubTrackSpec = {
  id: string
  state: string
  label: string
  shape: ScrollDemoScrubShapeSpec
}

type ScrollDemoOverlaySpec = {
  id: string
  state: string
  label: string
  from: string
  to: string
  trigger: string
  easing: string
  durationMs: number
  holdMs?: number
  style: string
  shape: ScrollDemoScrubShapeSpec
}

type ScrollDemoRenderSettings = {
  edge?: Partial<Pick<EdgeShaderConfig, 'intensity' | 'edgeWeight' | 'wobble' | 'tooth' | 'breakup' | 'shortMarks' | 'rake' | 'flecks' | 'speckles' | 'grain' | 'fineFibers' | 'erosion' | 'clustering' | 'detailScale' | 'dryBrush' | 'outerEdge' | 'innerEdge' | 'cornerBite' | 'inkBleed' | 'fiberAngle' | 'fiberFlow' | 'clusterScale' | 'boilAmount'>>
  shade?: {
    shadowIntensity?: number
    highlightIntensity?: number
    markStyle?: InnerShaderMarkStyle
    contourAlign?: number
    textureScale?: number
    fieldSoftness?: number
    spread?: number
    edgeBias?: number
    coverage?: number
    jitter?: number
    fieldDepth?: number
    densityEdge?: number
    rim?: number
    banding?: number
    warp?: number
    fieldContrast?: number
  }
}

type ScrollDemoMotionSettings = {
  reducedMotion?: MorphRuntimeReducedMotionFallbackV0
}

type ScrollDemoRuntimeSettings = {
  boil?: MorphRuntimeBoilModeV0
}

export type ScrollDemoScrubDataset = {
  version: number
  route: string
  component: string
  objectId: string
  storageKey: string
  title: string
  sourceIds?: {
    startId: string
    endId: string
  }
  track: ScrollDemoScrubTrackSpec[]
  overlays?: ScrollDemoOverlaySpec[]
  scrub: {
    source: 'element' | 'page' | 'section'
    easing: string
    smoothing: number
  }
  fill: {
    from: string
    to: string
  }
  viewBox: [number, number]
  geometry: {
    center: [number, number]
    pointDecimals: number
  }
  layer: {
    id: string
    name: string
    resolution: number
    smoothing: number
  }
  motion?: ScrollDemoMotionSettings
  settings?: ScrollDemoRuntimeSettings
  render?: ScrollDemoRenderSettings
  meta: {
    parityTarget: string
  }
}

export type ScrollDemoCueDataset = {
  version: number
  route: string
  component: string
  objectId: string
  storageKey: string
  title: string
  entry: string
  states: ScrollDemoScrubTrackSpec[]
  trigger: {
    id: string
    label: string
    from: string
    to: string
    easing: string
    durationMs: number
    style: string
    atScrollPx?: number
  }
  fill: {
    from: string
    to: string
  }
  viewBox: [number, number]
  geometry: {
    center: [number, number]
    pointDecimals: number
  }
  layer: {
    id: string
    name: string
    resolution: number
    smoothing: number
  }
  motion?: ScrollDemoMotionSettings
  settings?: ScrollDemoRuntimeSettings
  render?: ScrollDemoRenderSettings
  meta: {
    parityTarget: string
  }
}

type ShapeContext = {
  center: [number, number]
  pointDecimals: number
}

export const scrollDemoCueInViewSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-cue-in-view.json#scrollDemoCueInView'
export const scrollDemoCombinedSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-combined.json#scrollDemoCombined'
export const scrollDemoHeroSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-hero.json#scrollDemoHero'
export const scrollDemoPageSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-page.json#scrollDemoPage'
export const scrollDemoScrollPastSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-scroll-past.json#scrollDemoScrollPast'
export const scrollDemoTravelSourceDatasetV0 = 'packages/morph/exports/datasets/scroll-demo-travel.json#scrollDemoTravel'

export const scrollDemoCueInViewDatasetV0 = (scrollDemoCueInViewDatasetJson as { scrollDemoCueInView: ScrollDemoCueDataset }).scrollDemoCueInView
export const scrollDemoCombinedDatasetV0 = (scrollDemoCombinedDatasetJson as { scrollDemoCombined: ScrollDemoScrubDataset }).scrollDemoCombined
export const scrollDemoHeroDatasetV0 = (scrollDemoHeroDatasetJson as { scrollDemoHero: ScrollDemoScrubDataset }).scrollDemoHero
export const scrollDemoPageDatasetV0 = (scrollDemoPageDatasetJson as { scrollDemoPage: ScrollDemoScrubDataset }).scrollDemoPage
export const scrollDemoScrollPastDatasetV0 = (scrollDemoScrollPastDatasetJson as { scrollDemoScrollPast: ScrollDemoCueDataset }).scrollDemoScrollPast
export const scrollDemoTravelDatasetV0 = (scrollDemoTravelDatasetJson as { scrollDemoTravel: ScrollDemoScrubDataset }).scrollDemoTravel

export const scrollDemoCueInViewTargetV0 = createScrollDemoCueTarget(scrollDemoCueInViewDatasetV0)
export const scrollDemoCombinedTargetV0 = createScrollDemoTarget(scrollDemoCombinedDatasetV0)
export const scrollDemoHeroTargetV0 = createScrollDemoTarget(scrollDemoHeroDatasetV0)
export const scrollDemoPageTargetV0 = createScrollDemoTarget(scrollDemoPageDatasetV0)
export const scrollDemoScrollPastTargetV0 = createScrollDemoCueTarget(scrollDemoScrollPastDatasetV0)
export const scrollDemoTravelTargetV0 = createScrollDemoTarget(scrollDemoTravelDatasetV0)

export const drawableScrollDemoCueInViewRuntimeStorageKeyV0 = scrollDemoCueInViewTargetV0.storageKey
export const drawableScrollDemoCombinedRuntimeStorageKeyV0 = scrollDemoCombinedTargetV0.storageKey
export const drawableScrollDemoHeroRuntimeStorageKeyV0 = scrollDemoHeroTargetV0.storageKey
export const drawableScrollDemoPageRuntimeStorageKeyV0 = scrollDemoPageTargetV0.storageKey
export const drawableScrollDemoScrollPastRuntimeStorageKeyV0 = scrollDemoScrollPastTargetV0.storageKey
export const drawableScrollDemoTravelRuntimeStorageKeyV0 = scrollDemoTravelTargetV0.storageKey

export const drawableScrollDemoRuntimeTargetsV0 = {
  [drawableScrollDemoCueInViewRuntimeStorageKeyV0]: {
    dataset: scrollDemoCueInViewDatasetV0,
    sourceDataset: scrollDemoCueInViewSourceDatasetV0,
    target: scrollDemoCueInViewTargetV0,
    createScene: () => createScrollDemoCueInViewScene(),
  },
  [drawableScrollDemoCombinedRuntimeStorageKeyV0]: {
    dataset: scrollDemoCombinedDatasetV0,
    sourceDataset: scrollDemoCombinedSourceDatasetV0,
    target: scrollDemoCombinedTargetV0,
    createScene: () => createScrollDemoCombinedScrubScene(),
  },
  [drawableScrollDemoHeroRuntimeStorageKeyV0]: {
    dataset: scrollDemoHeroDatasetV0,
    sourceDataset: scrollDemoHeroSourceDatasetV0,
    target: scrollDemoHeroTargetV0,
    createScene: () => createScrollDemoHeroScrubScene(),
  },
  [drawableScrollDemoPageRuntimeStorageKeyV0]: {
    dataset: scrollDemoPageDatasetV0,
    sourceDataset: scrollDemoPageSourceDatasetV0,
    target: scrollDemoPageTargetV0,
    createScene: () => createScrollDemoPageScrubScene(),
  },
  [drawableScrollDemoScrollPastRuntimeStorageKeyV0]: {
    dataset: scrollDemoScrollPastDatasetV0,
    sourceDataset: scrollDemoScrollPastSourceDatasetV0,
    target: scrollDemoScrollPastTargetV0,
    createScene: () => createScrollDemoScrollPastScene(),
  },
  [drawableScrollDemoTravelRuntimeStorageKeyV0]: {
    dataset: scrollDemoTravelDatasetV0,
    sourceDataset: scrollDemoTravelSourceDatasetV0,
    target: scrollDemoTravelTargetV0,
    createScene: () => createScrollDemoTravelScrubScene(),
  },
}

export function createScrollDemoCueInViewScene(dataset = scrollDemoCueInViewDatasetV0): DrawableScene {
  return createScrollDemoCueScene(dataset, scrollDemoCueInViewSourceDatasetV0)
}

export function createScrollDemoCombinedScrubScene(dataset = scrollDemoCombinedDatasetV0): DrawableScene {
  return createScrollDemoScrubScene(dataset, scrollDemoCombinedSourceDatasetV0)
}

export function createScrollDemoHeroScrubScene(dataset = scrollDemoHeroDatasetV0): DrawableScene {
  return createScrollDemoScrubScene(dataset, scrollDemoHeroSourceDatasetV0)
}

export function createScrollDemoPageScrubScene(dataset = scrollDemoPageDatasetV0): DrawableScene {
  return createScrollDemoScrubScene(dataset, scrollDemoPageSourceDatasetV0)
}

export function createScrollDemoScrollPastScene(dataset = scrollDemoScrollPastDatasetV0): DrawableScene {
  return createScrollDemoCueScene(dataset, scrollDemoScrollPastSourceDatasetV0)
}

export function createScrollDemoTravelScrubScene(dataset = scrollDemoTravelDatasetV0): DrawableScene {
  return createScrollDemoScrubScene(dataset, scrollDemoTravelSourceDatasetV0)
}

export function createScrollDemoCueScene(dataset: ScrollDemoCueDataset, sourceDataset: string): DrawableScene {
  const target = createScrollDemoCueTarget(dataset)
  const inner = scrollDemoInnerShade(dataset.render?.shade)
  const entry = dataset.states.find((spec) => spec.state === dataset.entry) ?? dataset.states[0]
  if (!entry) throw new Error(`Scroll demo cue dataset ${dataset.storageKey} has no states.`)
  const context: ShapeContext = {
    center: dataset.geometry.center,
    pointDecimals: dataset.geometry.pointDecimals,
  }
  const states: NonNullable<DrawableScene['states']> = {}
  const layerStates: NonNullable<DrawableLayer['states']> = {}

  for (const spec of dataset.states) {
    states[spec.state] = {
      kind: spec.state === entry.state ? 'rest' : 'pose',
      label: spec.label,
    }
    if (spec.state !== entry.state) {
      layerStates[spec.state] = {
        kind: 'closed',
        points: shapePoints(spec.shape, context),
      }
    }
  }

  return {
    id: target.storageKey,
    kind: 'animate',
    viewBox: dataset.viewBox,
    entry: entry.state,
    states,
    transitions: [{
      from: dataset.trigger.from,
      to: dataset.trigger.to,
      trigger: dataset.trigger.id,
      easing: dataset.trigger.easing,
      durationMs: dataset.trigger.durationMs,
      style: dataset.trigger.style,
      ...(typeof dataset.trigger.atScrollPx === 'number' ? { atScrollPx: dataset.trigger.atScrollPx } : {}),
    }],
    layers: [{
      id: dataset.layer.id,
      name: dataset.layer.name,
      geometry: { kind: 'closed', points: shapePoints(entry.shape, context) },
      states: layerStates,
      resolution: dataset.layer.resolution,
      smoothing: dataset.layer.smoothing,
      edge: scrollDemoEdge(dataset.render?.edge),
      ...(inner ? { inner } : {}),
      fill: {
        image: {
          href: gradientDataUri(target.fill.from, target.fill.to, dataset.viewBox[0], dataset.viewBox[1]),
          x: 0,
          y: 0,
          width: dataset.viewBox[0],
          height: dataset.viewBox[1],
          preserveAspectRatio: 'xMidYMid slice',
        },
        opacity: 1,
      },
      passes: {
        fill: true,
        edge: true,
        grain: false,
        hatching: false,
      },
    }],
    meta: {
      sourceDataset,
      sourceVersion: dataset.version,
      sourceRoute: target.route,
      sourceComponent: target.component,
      sourceObjectId: target.objectId,
      sourceTrack: [...target.track],
      parityTarget: dataset.meta.parityTarget,
    },
  }
}

export function createScrollDemoScrubScene(dataset: ScrollDemoScrubDataset, sourceDataset: string): DrawableScene {
  const target = createScrollDemoTarget(dataset)
  const inner = scrollDemoInnerShade(dataset.render?.shade)
  const [entry, ...poses] = dataset.track
  const context: ShapeContext = {
    center: dataset.geometry.center,
    pointDecimals: dataset.geometry.pointDecimals,
  }
  const states: NonNullable<DrawableScene['states']> = {}
  const layerStates: NonNullable<DrawableLayer['states']> = {}

  for (const [index, spec] of dataset.track.entries()) {
    states[spec.state] = {
      kind: index === 0 ? 'rest' : 'pose',
      label: spec.label,
    }
  }

  for (const spec of poses) {
    layerStates[spec.state] = {
      kind: 'closed',
      points: shapePoints(spec.shape, context),
    }
  }
  for (const spec of dataset.overlays ?? []) {
    states[spec.state] = {
      kind: 'pose',
      label: spec.label,
    }
    layerStates[spec.state] = {
      kind: 'closed',
      points: shapePoints(spec.shape, context),
    }
  }

  return {
    id: target.storageKey,
    kind: 'animate',
    viewBox: dataset.viewBox,
    entry: entry.state,
    states,
    ...(dataset.overlays?.length ? {
      transitions: dataset.overlays.map((overlay) => ({
        id: overlay.id,
        from: overlay.from,
        to: overlay.to,
        trigger: overlay.trigger,
        easing: overlay.easing,
        durationMs: overlay.durationMs,
        ...(typeof overlay.holdMs === 'number' ? { holdMs: overlay.holdMs } : {}),
        style: overlay.style,
      })),
      composition: {
        mode: 'scrub-additive-overlays',
      } as const,
    } : {}),
    scrub: {
      source: dataset.scrub.source,
      track: [...target.stateTrack],
      easing: target.easing,
      smoothing: target.smoothing,
      ...(dataset.scrub.source === 'section' && target.sourceIds.startId ? { startId: target.sourceIds.startId } : {}),
      ...(dataset.scrub.source === 'section' && target.sourceIds.endId ? { endId: target.sourceIds.endId } : {}),
    },
    layers: [{
      id: dataset.layer.id,
      name: dataset.layer.name,
      geometry: { kind: 'closed', points: shapePoints(entry.shape, context) },
      states: layerStates,
      resolution: dataset.layer.resolution,
      smoothing: dataset.layer.smoothing,
      edge: scrollDemoEdge(dataset.render?.edge),
      ...(inner ? { inner } : {}),
      fill: {
        image: {
          href: gradientDataUri(target.fill.from, target.fill.to, dataset.viewBox[0], dataset.viewBox[1]),
          x: 0,
          y: 0,
          width: dataset.viewBox[0],
          height: dataset.viewBox[1],
          preserveAspectRatio: 'xMidYMid slice',
        },
        opacity: 1,
      },
      passes: {
        fill: true,
        edge: true,
        grain: false,
        hatching: false,
      },
    }],
    meta: {
      sourceDataset,
      sourceVersion: dataset.version,
      sourceRoute: target.route,
      sourceComponent: target.component,
      sourceObjectId: target.objectId,
      sourceTrack: [...target.track],
      ...(dataset.overlays?.length ? { sourceOverlays: dataset.overlays.map((overlay) => overlay.id) } : {}),
      parityTarget: dataset.meta.parityTarget,
    },
  }
}

function createScrollDemoTarget(dataset: ScrollDemoScrubDataset) {
  return {
    route: dataset.route,
    component: dataset.component,
    objectId: dataset.objectId,
    storageKey: dataset.storageKey,
    title: dataset.title,
    sourceIds: dataset.sourceIds ?? { startId: '', endId: '' },
    track: dataset.track.map((item) => item.id),
    stateTrack: dataset.track.map((item) => item.state),
    easing: dataset.scrub.easing,
    smoothing: dataset.scrub.smoothing,
    fill: dataset.fill,
    tags: [
      'morph-lab',
      'scroll-demo',
      'scroll-scrub',
      ...(dataset.overlays?.length ? ['layered-gesture'] : []),
      'site-player',
      'svg-runtime',
    ],
    optionalCapabilities: [
      'scroll-scrub',
      ...(dataset.overlays?.length ? ['additive-overlays', 'pointer-hover'] : []),
      ...(dataset.overlays?.some((overlay) => overlay.trigger === 'click') ? ['pointer-press'] : []),
      'procedural-marks',
      'image-fill',
    ],
    controllers: [
      { id: 'scroll-progress', type: 'slider', label: 'Scroll Progress', channel: 'viewport', default: 0, min: 0, max: 1 },
      ...(dataset.overlays ?? []).map((overlay) => ({
        id: overlay.trigger.replace(/-(on|off)$/u, ''),
        type: 'trigger',
        label: overlay.label,
        channel: 'pointer',
      })),
    ],
  }
}

function createScrollDemoCueTarget(dataset: ScrollDemoCueDataset) {
  return {
    route: dataset.route,
    component: dataset.component,
    objectId: dataset.objectId,
    storageKey: dataset.storageKey,
    title: dataset.title,
    track: dataset.states.map((item) => item.id),
    stateTrack: dataset.states.map((item) => item.state),
    fill: dataset.fill,
    tags: ['morph-lab', 'scroll-demo', 'scroll-cue', 'site-player', 'svg-runtime'],
    optionalCapabilities: ['procedural-marks', 'image-fill'],
    controllers: [
      { id: dataset.trigger.id, type: 'trigger', label: dataset.trigger.label, channel: 'viewport' },
    ],
  }
}

function gradientDataUri(from: string, to: string, width: number, height: number) {
  return 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs><rect width='${width}' height='${height}' fill='url(#g)'/></svg>`,
  )
}

function shapePoints(shape: ScrollDemoScrubShapeSpec, context: ShapeContext): DrawablePoint[] {
  if (shape.kind === 'circle') {
    return circle(shape.radius, context)
  }
  if (shape.kind === 'ellipse') {
    return ellipse(shape.rx, shape.ry, context)
  }
  if (shape.kind === 'superShape') {
    return superShape(shape.radius, shape.power, context)
  }
  return star(shape.outerRadius, shape.innerRadius, shape.points, context)
}

function poly(fn: (t: number) => DrawablePoint, context: ShapeContext, count = 72): DrawablePoint[] {
  return Array.from({ length: count }, (_, index) => cleanPoint(fn(index / count), context.pointDecimals))
}

function circle(radius: number, context: ShapeContext) {
  const [cx, cy] = context.center
  return poly((t) => {
    const angle = t * Math.PI * 2
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    }
  }, context)
}

function ellipse(rx: number, ry: number, context: ShapeContext) {
  const [cx, cy] = context.center
  return poly((t) => {
    const angle = t * Math.PI * 2
    return {
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    }
  }, context)
}

function superShape(radius: number, power: number, context: ShapeContext) {
  const [cx, cy] = context.center
  return poly((t) => {
    const angle = t * Math.PI * 2
    const c = Math.sign(Math.cos(angle)) * Math.abs(Math.cos(angle)) ** (2 / power)
    const s = Math.sign(Math.sin(angle)) * Math.abs(Math.sin(angle)) ** (2 / power)
    return {
      x: cx + c * radius,
      y: cy + s * radius,
    }
  }, context)
}

function star(outerRadius: number, innerRadius: number, points: number, context: ShapeContext) {
  const [cx, cy] = context.center
  return poly((t) => {
    const angle = t * Math.PI * 2
    const radius = innerRadius + (outerRadius - innerRadius) * (Math.cos(t * Math.PI * 2 * points) * 0.5 + 0.5)
    return {
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    }
  }, context, points * 24)
}

function cleanPoint(point: DrawablePoint, pointDecimals: number): DrawablePoint {
  return {
    x: round(point.x, pointDecimals),
    y: round(point.y, pointDecimals),
  }
}

function round(value: number, pointDecimals: number) {
  const scale = 10 ** pointDecimals
  return Math.round(value * scale) / scale
}

function scrollDemoEdge(edge: ScrollDemoRenderSettings['edge'] = {}): EdgeShaderConfig {
  return {
    intensity: cleanRenderNumber(edge.intensity, 10, 0, 16),
    wobble: cleanRenderNumber(edge.wobble, 0.22, 0, 1),
    tooth: cleanRenderNumber(edge.tooth, 0.5, 0, 1.8),
    breakup: cleanRenderNumber(edge.breakup, 0.45, 0, 1),
    shortMarks: cleanRenderNumber(edge.shortMarks, 0.06, 0, 1),
    rake: cleanRenderNumber(edge.rake, 0.08, 0, 1.5),
    flecks: cleanRenderNumber(edge.flecks, 0.4, 0, 1.5),
    speckles: cleanRenderNumber(edge.speckles, 0.5, 0, 2),
    grain: cleanRenderNumber(edge.grain, 0.4, 0, 1),
    fineFibers: cleanRenderNumber(edge.fineFibers, 0, 0, 1),
    erosion: cleanRenderNumber(edge.erosion, 0.18, 0, 1),
    clustering: cleanRenderNumber(edge.clustering, 0.2, 0, 1),
    detailScale: cleanRenderNumber(edge.detailScale, 1, 0.35, 2.5),
    outerEdge: cleanRenderNumber(edge.outerEdge, 1, 0, 2),
    innerEdge: cleanRenderNumber(edge.innerEdge, 0.55, 0, 2),
    cornerBite: cleanRenderNumber(edge.cornerBite, 0.18, 0, 1.5),
    inkBleed: cleanRenderNumber(edge.inkBleed, 0.12, 0, 1.8),
    edgeWeight: cleanRenderNumber(edge.edgeWeight, 0.18, 0, 1),
    dryBrush: cleanRenderNumber(edge.dryBrush, 0.12, 0, 1),
    fiberAngle: cleanRenderNumber(edge.fiberAngle, 0, -90, 90),
    fiberFlow: cleanRenderNumber(edge.fiberFlow, 0.2, 0, 1),
    clusterScale: cleanRenderNumber(edge.clusterScale, 1, 0.35, 2.5),
    boilAmount: cleanRenderNumber(edge.boilAmount, 1, 0, 2),
    jitterFps: 0,
  }
}

function scrollDemoInnerShade(shade: ScrollDemoRenderSettings['shade']): InnerShaderConfig | null {
  if (!shade) return null
  const markStyle = shade.markStyle ?? 'halftone'
  const contourAlign = cleanRenderNumber(shade.contourAlign, 0.78, 0, 1)
  const textureScale = cleanRenderNumber(shade.textureScale, 0.95, 0.35, 2.5)
  const fieldSoftness = cleanRenderNumber(shade.fieldSoftness, 0.8, 0, 1)
  const spread = cleanOptionalRenderNumber(shade.spread, 0.1, 1.35)
  const edgeBias = cleanOptionalRenderNumber(shade.edgeBias, 0.15, 3)
  const coverage = cleanOptionalRenderNumber(shade.coverage, 0.05, 1)
  const jitter = cleanOptionalRenderNumber(shade.jitter, 0, 1)
  const fieldDepth = cleanOptionalRenderNumber(shade.fieldDepth, 0.35, 2.2)
  const densityEdge = cleanOptionalRenderNumber(shade.densityEdge, 0, 1.4)
  const rim = cleanOptionalRenderNumber(shade.rim, 0, 1.6)
  const banding = cleanOptionalRenderNumber(shade.banding, 0, 1)
  const warp = cleanOptionalRenderNumber(shade.warp, 0, 1.5)
  const fieldContrast = cleanOptionalRenderNumber(shade.fieldContrast, 0, 1)
  const shadowIntensity = cleanRenderNumber(shade.shadowIntensity, 0.34, 0, 0.9)
  const highlightIntensity = cleanRenderNumber(shade.highlightIntensity, 0.14, 0, 0.9)
  if (shadowIntensity <= 0 && highlightIntensity <= 0) return null

  return {
    innerShadow: shadowIntensity > 0 ? {
      angle: 132,
      offset: 26,
      intensity: shadowIntensity,
      style: markStyle,
      spread: spread ?? 0.58,
      edgeBias,
      textureScale,
      jitter,
      contourAlign,
      coverage: coverage ?? 0.62,
      rim,
      banding,
      warp,
      fieldDepth,
      fieldSoftness,
      fieldContrast,
      densityEdge,
    } : null,
    highlight: highlightIntensity > 0 ? {
      angle: 312,
      offset: 22,
      intensity: highlightIntensity,
      style: markStyle,
      spread: spread ?? 0.4,
      edgeBias,
      textureScale,
      jitter,
      contourAlign,
      coverage: coverage ?? 0.38,
      rim,
      banding,
      warp,
      fieldDepth,
      fieldSoftness,
      fieldContrast,
      densityEdge,
    } : null,
  }
}

function cleanRenderNumber(value: number | undefined, fallback: number, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.round(Math.max(min, Math.min(max, value)) * 1000) / 1000
}

function cleanOptionalRenderNumber(value: number | undefined, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.round(Math.max(min, Math.min(max, value)) * 1000) / 1000
}
