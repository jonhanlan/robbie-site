import { compileMorphRuntimeDocumentV0, type MorphRuntimeCompileResultV0 } from './export-compiler'
import type { MorphRuntimeBoilModeV0, MorphRuntimeReducedMotionFallbackV0 } from './runtime-contract'
import { drawableShadePassMarkBudgetV0 } from './shade-pipeline'
import type {
  DrawableLayer,
  DrawablePoint,
  DrawableScene,
  EdgeShaderConfig,
  InnerShaderConfig,
  InnerShaderMarkStyle,
  InnerShaderPassConfig,
  InnerShaderPassFieldInputs,
  InnerShaderPassRole,
  InnerShaderPipelinePass,
  StrokePoint,
} from './types'

export const drawableFlowerOrnamentDatasetKindV0 = 'flowerOrnament'
export const drawableFlowerOrnamentDatasetKeyV0 = 'flowerOrnament'
export const drawableFlowerOrnamentRuntimeStorageKeyV0 = 'flower-ornament'
export const drawableFlowerOrnamentDatasetDraftKeyV0 =
  'packages/morph/exports/datasets/flower-ornament.json#flowerOrnament'
export const drawableFlowerOrnamentRuntimeExportedAtV0 = '2026-06-29T00:00:00.000Z'

export type FlowerOrnamentDatasetV0 = {
  schema?: string
  version?: number
  viewBox?: [number, number]
  motion?: Partial<FlowerOrnamentMotionProfileV0>
  settings?: Partial<FlowerOrnamentSettingsProfileV0>
  render?: Partial<FlowerOrnamentRenderProfileV0>
  petals?: FlowerOrnamentPetalV0[]
  center?: Partial<FlowerOrnamentCenterV0>
  ribbons?: FlowerOrnamentRibbonV0[]
}

export type FlowerOrnamentMotionProfileV0 = {
  hoverDurationMs: number
  hoverOffDurationMs: number
  easing: string
  fps: number
  reducedMotion: MorphRuntimeReducedMotionFallbackV0
}

export type FlowerOrnamentSettingsProfileV0 = {
  boil: MorphRuntimeBoilModeV0
}

export type FlowerOrnamentRenderProfileV0 = {
  edge: EdgeShaderConfig
  shade: FlowerOrnamentShadeProfileV0
}

export type FlowerOrnamentShadeProfileV0 = {
  shadowIntensity: number
  highlightIntensity: number
  contactIntensity: number
  toneIntensity: number
  ambientIntensity: number
  castIntensity: number
  markStyle: InnerShaderMarkStyle
  contourAlign: number
  textureScale: number
  fieldSoftness: number
}

export type FlowerOrnamentPetalV0 = {
  id?: string
  cx?: number
  cy?: number
  rx?: number
  ry?: number
  angle?: number
  fill?: string
}

export type FlowerOrnamentCenterV0 = {
  id: string
  cx: number
  cy: number
  rx: number
  ry: number
  fill: string
}

export type FlowerOrnamentRibbonV0 = {
  id?: string
  fill?: string
  points?: StrokePoint[]
}

export type FlowerOrnamentRuntimeCompileOptionsV0 = {
  exportedAt?: string
}

type ResolvedFlowerOrnamentDatasetV0 = {
  version: number
  viewBox: [number, number]
  motion: FlowerOrnamentMotionProfileV0
  settings: FlowerOrnamentSettingsProfileV0
  render: FlowerOrnamentRenderProfileV0
  petals: Required<FlowerOrnamentPetalV0>[]
  center: FlowerOrnamentCenterV0
  ribbons: Required<FlowerOrnamentRibbonV0>[]
}

const FLOWER_CENTER: DrawablePoint = { x: 120, y: 112 }
const DEFAULT_VIEW_BOX: [number, number] = [240, 240]
const PETAL_POINT_COUNT = 22
const CENTER_POINT_COUNT = 18
const DECIMALS = 3
const DEFAULT_MOTION: FlowerOrnamentMotionProfileV0 = {
  hoverDurationMs: 420,
  hoverOffDurationMs: 520,
  easing: 'smoothstep',
  fps: 18,
  reducedMotion: 'first-frame',
}
const DEFAULT_SETTINGS: FlowerOrnamentSettingsProfileV0 = {
  boil: 'active-only',
}
const DEFAULT_EDGE: EdgeShaderConfig = {
  intensity: 0.84,
  wobble: 0.08,
  tooth: 0.24,
  breakup: 0.12,
  shortMarks: 0.06,
  rake: 0.03,
  flecks: 0.05,
  speckles: 0.04,
  grain: 0.08,
  fineFibers: 0.08,
  erosion: 0.06,
  clustering: 0.1,
  detailScale: 0.68,
  outerEdge: 0.48,
  innerEdge: 0.22,
  cornerBite: 0.08,
  inkBleed: 0.05,
  edgeWeight: 0.26,
  dryBrush: 0.1,
  fiberAngle: -18,
  fiberFlow: 0.18,
  clusterScale: 0.76,
  boilAmount: 0.2,
  jitterFps: 12,
}
const DEFAULT_SHADE: FlowerOrnamentShadeProfileV0 = {
  shadowIntensity: 0.38,
  highlightIntensity: 0.18,
  contactIntensity: 0.32,
  toneIntensity: 0.46,
  ambientIntensity: 0.34,
  castIntensity: 0.44,
  markStyle: 'flow',
  contourAlign: 0.86,
  textureScale: 0.92,
  fieldSoftness: 0.62,
}
const DEFAULT_PETALS: Required<FlowerOrnamentPetalV0>[] = [
  { id: 'petal-n', cx: 120, cy: 70, rx: 28, ry: 52, angle: 0, fill: '#e97881' },
  { id: 'petal-ne', cx: 155, cy: 86, rx: 27, ry: 50, angle: 45, fill: '#f09b66' },
  { id: 'petal-se', cx: 160, cy: 126, rx: 26, ry: 49, angle: 98, fill: '#f2c35b' },
  { id: 'petal-s', cx: 120, cy: 150, rx: 28, ry: 52, angle: 180, fill: '#d9b847' },
  { id: 'petal-sw', cx: 80, cy: 126, rx: 26, ry: 49, angle: 262, fill: '#87bf70' },
  { id: 'petal-nw', cx: 85, cy: 86, rx: 27, ry: 50, angle: 315, fill: '#62a6a4' },
]
const DEFAULT_CENTER: FlowerOrnamentCenterV0 = {
  id: 'flower-center',
  cx: 120,
  cy: 112,
  rx: 20,
  ry: 18,
  fill: '#5f4154',
}
const DEFAULT_RIBBONS: Required<FlowerOrnamentRibbonV0>[] = [{
  id: 'stem-curl',
  fill: '#587a59',
  points: [
    { x: 122, y: 126, w: 10 },
    { x: 116, y: 154, w: 9 },
    { x: 128, y: 184, w: 8 },
    { x: 105, y: 209, w: 7 },
    { x: 72, y: 198, w: 6 },
    { x: 78, y: 172, w: 5 },
  ],
}]
const MARK_STYLES: InnerShaderMarkStyle[] = ['halftone', 'dots', 'stipple', 'hatch', 'cross', 'grain', 'scratch', 'flow', 'dry']

export function compileFlowerOrnamentRuntimeDocumentFromDatasetV0(
  dataset: FlowerOrnamentDatasetV0 = {},
  options: FlowerOrnamentRuntimeCompileOptionsV0 = {},
): MorphRuntimeCompileResultV0 {
  const source = resolveFlowerOrnamentDatasetV0(dataset)
  const scene = createDrawableFlowerOrnamentSceneV0(source)

  return compileMorphRuntimeDocumentV0(scene, {
    exportedAt: options.exportedAt ?? drawableFlowerOrnamentRuntimeExportedAtV0,
    source: {
      app: 'Morph Lab',
      documentKind: scene.kind,
      storageKey: drawableFlowerOrnamentRuntimeStorageKeyV0,
      draftKey: drawableFlowerOrnamentDatasetDraftKeyV0,
    },
    manifest: {
      title: 'Flower ornament authoring proof',
      tags: ['morph-lab', 'flower', 'ornament', 'authoring-proof', 'site-player', 'svg-runtime'],
    },
    capabilities: {
      required: ['svg', 'state-motion'],
      optional: ['pointer-hover', 'procedural-marks'],
    },
    renderTier: 'svg',
    quality: 'high',
    fallbacks: { reducedMotion: source.motion.reducedMotion },
    settings: { boil: source.settings.boil },
    controllers: [
      { id: 'hover', type: 'trigger', label: 'Hover', channel: 'pointer' },
    ],
    generated: [{
      id: 'flower-ornament-source-compiler',
      kind: 'baked',
      owner: 'morph-flower-ornament-source-compiler',
      target: 'scene.layers',
      baked: true,
      clearable: false,
      createdAt: options.exportedAt ?? drawableFlowerOrnamentRuntimeExportedAtV0,
    }],
    includeFieldCache: false,
    fieldCacheProgressSamples: [],
  })
}

export function createDrawableFlowerOrnamentSceneV0(source: ResolvedFlowerOrnamentDatasetV0): DrawableScene {
  const layers: DrawableLayer[] = [
    ...source.ribbons.map((ribbon, index) => ribbonLayer(ribbon, index, source.render)),
    ...source.petals.map((petal, index) => petalLayer(petal, index, source.render)),
    centerLayer(source.center, source.render),
  ]
  addFlowerCastShadow(layers[0]!, 1, 4, 7, source.render.shade)
  addFlowerCastShadow(layers[1]!, 1, 3, 5, source.render.shade)

  return {
    id: drawableFlowerOrnamentRuntimeStorageKeyV0,
    kind: 'animate',
    viewBox: source.viewBox,
    entry: 'rest',
    states: {
      rest: { kind: 'rest', label: 'Rest' },
      hover: { kind: 'hover', label: 'Bloom' },
    },
    stateGraph: {
      entry: 'rest',
      states: {
        rest: { kind: 'rest', label: 'Rest' },
        hover: { kind: 'hover', label: 'Bloom' },
      },
      transitions: [
        {
          from: '*',
          to: 'hover',
          trigger: 'hover-on',
          durationMs: source.motion.hoverDurationMs,
          easing: source.motion.easing,
          fps: source.motion.fps,
          interrupt: 'restart',
        },
        {
          from: '*',
          to: 'rest',
          trigger: 'hover-off',
          durationMs: source.motion.hoverOffDurationMs,
          easing: source.motion.easing,
          fps: source.motion.fps,
          interrupt: 'restart',
        },
      ],
    },
    layers,
    meta: {
      title: 'Flower ornament authoring proof',
      sourceDataset: drawableFlowerOrnamentDatasetKeyV0,
      datasetVersion: source.version,
    },
  }
}

function resolveFlowerOrnamentDatasetV0(dataset: FlowerOrnamentDatasetV0): ResolvedFlowerOrnamentDatasetV0 {
  return {
    version: cleanInteger(dataset.version, 0),
    viewBox: validViewBox(dataset.viewBox) ? dataset.viewBox : DEFAULT_VIEW_BOX,
    motion: {
      hoverDurationMs: cleanDuration(dataset.motion?.hoverDurationMs, DEFAULT_MOTION.hoverDurationMs),
      hoverOffDurationMs: cleanDuration(dataset.motion?.hoverOffDurationMs, DEFAULT_MOTION.hoverOffDurationMs),
      easing: cleanString(dataset.motion?.easing, DEFAULT_MOTION.easing),
      fps: cleanDuration(dataset.motion?.fps, DEFAULT_MOTION.fps),
      reducedMotion: cleanReducedMotion(dataset.motion?.reducedMotion),
    },
    settings: {
      boil: cleanBoil(dataset.settings?.boil),
    },
    render: {
      edge: {
        ...DEFAULT_EDGE,
        ...cleanEdge(dataset.render?.edge),
      },
      shade: {
        shadowIntensity: cleanRange(dataset.render?.shade?.shadowIntensity, DEFAULT_SHADE.shadowIntensity, 0, 0.9),
        highlightIntensity: cleanRange(dataset.render?.shade?.highlightIntensity, DEFAULT_SHADE.highlightIntensity, 0, 0.9),
        contactIntensity: cleanRange(dataset.render?.shade?.contactIntensity, DEFAULT_SHADE.contactIntensity, 0, 1.2),
        toneIntensity: cleanRange(dataset.render?.shade?.toneIntensity, DEFAULT_SHADE.toneIntensity, 0, 1.2),
        ambientIntensity: cleanRange(dataset.render?.shade?.ambientIntensity, DEFAULT_SHADE.ambientIntensity, 0, 1.2),
        castIntensity: cleanRange(dataset.render?.shade?.castIntensity, DEFAULT_SHADE.castIntensity, 0, 1.2),
        markStyle: cleanMarkStyle(dataset.render?.shade?.markStyle),
        contourAlign: cleanRange(dataset.render?.shade?.contourAlign, DEFAULT_SHADE.contourAlign, 0, 1),
        textureScale: cleanRange(dataset.render?.shade?.textureScale, DEFAULT_SHADE.textureScale, 0.35, 2.5),
        fieldSoftness: cleanRange(dataset.render?.shade?.fieldSoftness, DEFAULT_SHADE.fieldSoftness, 0, 1),
      },
    },
    petals: (dataset.petals?.length ? dataset.petals : DEFAULT_PETALS).map((petal, index) => ({
      id: cleanIdentifier(petal.id, DEFAULT_PETALS[index]?.id ?? `petal-${index + 1}`),
      cx: cleanNumber(petal.cx, DEFAULT_PETALS[index]?.cx ?? FLOWER_CENTER.x),
      cy: cleanNumber(petal.cy, DEFAULT_PETALS[index]?.cy ?? FLOWER_CENTER.y),
      rx: cleanPositive(petal.rx, DEFAULT_PETALS[index]?.rx ?? 24),
      ry: cleanPositive(petal.ry, DEFAULT_PETALS[index]?.ry ?? 44),
      angle: cleanNumber(petal.angle, DEFAULT_PETALS[index]?.angle ?? index * 45),
      fill: cleanColor(petal.fill, DEFAULT_PETALS[index]?.fill ?? '#e97881'),
    })),
    center: {
      id: cleanIdentifier(dataset.center?.id, DEFAULT_CENTER.id),
      cx: cleanNumber(dataset.center?.cx, DEFAULT_CENTER.cx),
      cy: cleanNumber(dataset.center?.cy, DEFAULT_CENTER.cy),
      rx: cleanPositive(dataset.center?.rx, DEFAULT_CENTER.rx),
      ry: cleanPositive(dataset.center?.ry, DEFAULT_CENTER.ry),
      fill: cleanColor(dataset.center?.fill, DEFAULT_CENTER.fill),
    },
    ribbons: (dataset.ribbons?.length ? dataset.ribbons : DEFAULT_RIBBONS).map((ribbon, index) => ({
      id: cleanIdentifier(ribbon.id, DEFAULT_RIBBONS[index]?.id ?? `ribbon-${index + 1}`),
      fill: cleanColor(ribbon.fill, DEFAULT_RIBBONS[index]?.fill ?? '#587a59'),
      points: cleanRibbonPoints(ribbon.points, DEFAULT_RIBBONS[index]?.points ?? DEFAULT_RIBBONS[0].points),
    })),
  }
}

function petalLayer(
  petal: Required<FlowerOrnamentPetalV0>,
  index: number,
  render: FlowerOrnamentRenderProfileV0,
): DrawableLayer {
  const rest = ellipsePoints(petal.cx, petal.cy, petal.rx, petal.ry, petal.angle, PETAL_POINT_COUNT, 0)
  const hover = bloomPoints(rest, FLOWER_CENTER, 1.08 + index * 0.004, 0.6 + index * 0.04)

  return {
    id: petal.id,
    geometry: { kind: 'closed', points: rest },
    states: { hover: { kind: 'closed', points: hover } },
    resolution: rest.length,
    smoothing: 0.62,
    edge: layerEdge(render.edge, index),
    fill: { fill: petal.fill, opacity: 0.94, grain: 0.08 },
    inner: innerShade(render.shade, 132 - index * 8, 308 + index * 5),
    passes: {
      fill: true,
      edge: true,
      innerShadow: render.shade.shadowIntensity > 0,
      highlight: render.shade.highlightIntensity > 0,
      grain: true,
      hatching: false,
    },
  }
}

function centerLayer(center: FlowerOrnamentCenterV0, render: FlowerOrnamentRenderProfileV0): DrawableLayer {
  const rest = ellipsePoints(center.cx, center.cy, center.rx, center.ry, -8, CENTER_POINT_COUNT, 0.05)
  const hover = bloomPoints(rest, FLOWER_CENTER, 1.035, -0.4)
  return {
    id: center.id,
    geometry: { kind: 'closed', points: rest },
    states: { hover: { kind: 'closed', points: hover } },
    resolution: rest.length,
    smoothing: 0.48,
    edge: layerEdge(render.edge, 8),
    fill: { fill: center.fill, opacity: 0.98, grain: 0.12 },
    inner: innerShade({
      ...render.shade,
      shadowIntensity: Math.min(0.9, render.shade.shadowIntensity + 0.1),
      highlightIntensity: Math.min(0.9, render.shade.highlightIntensity + 0.08),
      markStyle: 'stipple',
    }, 145, 320),
    passes: {
      fill: true,
      edge: true,
      innerShadow: true,
      highlight: true,
      grain: true,
      hatching: false,
    },
  }
}

function ribbonLayer(
  ribbon: Required<FlowerOrnamentRibbonV0>,
  index: number,
  render: FlowerOrnamentRenderProfileV0,
): DrawableLayer {
  const rest = ribbon.points.map((point) => ({
    x: round(point.x),
    y: round(point.y),
    w: round(point.w ?? 7),
  }))
  const hover = rest.map((point, pointIndex) => ({
    x: round(point.x + Math.sin(pointIndex * 1.7 + index) * 2.2),
    y: round(point.y - 1.8 + Math.cos(pointIndex * 1.1) * 1.4),
    w: round((point.w ?? 7) * (1.04 - pointIndex * 0.01)),
  }))

  return {
    id: ribbon.id,
    geometry: {
      kind: 'ribbon',
      strokes: [rest],
      style: {
        cap: 'round',
        join: 'round',
        taper: {
          start: 0.2,
          end: 0.36,
        },
      },
    },
    states: {
      hover: {
        kind: 'ribbon',
        strokes: [hover],
        style: {
          cap: 'round',
          join: 'round',
          taper: {
            start: 0.2,
            end: 0.36,
          },
        },
      },
    },
    resolution: rest.length,
    smoothing: 0.5,
    edge: layerEdge(render.edge, index + 12),
    fill: { fill: ribbon.fill, opacity: 0.9, grain: 0.06 },
    inner: innerShade({
      ...render.shade,
      shadowIntensity: Math.min(0.9, render.shade.shadowIntensity + 0.04),
      highlightIntensity: Math.max(0, render.shade.highlightIntensity - 0.04),
      markStyle: 'dry',
    }, 118, 296),
    passes: {
      fill: true,
      edge: true,
      innerShadow: true,
      highlight: render.shade.highlightIntensity > 0.04,
      grain: true,
      hatching: false,
    },
  }
}

function innerShade(shade: FlowerOrnamentShadeProfileV0, shadowAngle: number, highlightAngle: number): InnerShaderConfig {
  const coreShadow = flowerShadePassConfig(shade, {
    angle: shadowAngle,
    offset: 16,
    intensity: shade.shadowIntensity,
    style: shade.markStyle,
    spread: 0.52,
    textureScale: shade.textureScale,
    contourAlign: shade.contourAlign,
    coverage: 0.66,
    fieldSoftness: shade.fieldSoftness,
    densityEdge: 0.72,
    densityFalloff: 0.5,
  })
  const contactShadow = flowerShadePassConfig(shade, {
    angle: shadowAngle + 14,
    offset: 7,
    intensity: Math.max(0.05, shade.shadowIntensity * shade.contactIntensity),
    style: 'dry',
    spread: 0.24,
    textureScale: Math.max(0.35, shade.textureScale * 0.8),
    contourAlign: Math.min(1, shade.contourAlign + 0.1),
    coverage: 0.28,
    rim: 0.34,
    fieldSoftness: Math.min(1, shade.fieldSoftness + 0.22),
    densityEdge: 0.38,
    densityFalloff: 0.78,
    sizeFalloff: 0.7,
  })
  const rimLight = flowerShadePassConfig(shade, {
    angle: highlightAngle,
    offset: 10,
    intensity: shade.highlightIntensity,
    style: 'hatch',
    spread: 0.34,
    textureScale: shade.textureScale * 0.9,
    contourAlign: Math.min(1, shade.contourAlign + 0.08),
    coverage: 0.42,
    fieldSoftness: shade.fieldSoftness,
    densityFalloff: 0.58,
    sizeFalloff: 0.42,
  })
  const toneZone = flowerShadePassConfig(shade, {
    angle: shadowAngle + 28,
    offset: 9,
    intensity: Math.max(0.06, shade.shadowIntensity * shade.toneIntensity),
    style: 'stipple',
    spread: 0.42,
    textureScale: Math.max(0.35, shade.textureScale * 0.74),
    contourAlign: Math.min(1, shade.contourAlign + 0.04),
    coverage: 0.54,
    banding: 3,
    fieldSoftness: Math.min(1, shade.fieldSoftness + 0.16),
    densityEdge: 0.46,
    densityFalloff: 0.66,
    sizeFalloff: 0.6,
  })
  const ambientContour = flowerShadePassConfig(shade, {
    angle: shadowAngle + 72,
    offset: 5,
    intensity: Math.max(0.05, shade.shadowIntensity * shade.ambientIntensity),
    style: 'grain',
    spread: 0.3,
    textureScale: Math.max(0.35, shade.textureScale * 0.68),
    contourAlign: 0.96,
    coverage: 0.9,
    rim: 0.22,
    fieldSoftness: Math.min(1, shade.fieldSoftness + 0.28),
    densityEdge: 0.4,
    densityFalloff: 0.74,
    sizeFalloff: 0.68,
  })

  return {
    innerShadow: null,
    highlight: null,
    shadePasses: [
      ...(shade.shadowIntensity > 0 ? [
        authoredFlowerShadePass('core-shadow', 'core-shadow', false, 9, coreShadow),
        authoredFlowerShadePass('contact-shadow', 'contact-shadow', false, 73, contactShadow),
        authoredFlowerShadePass('tone-zone', 'tone-zone', false, 41, toneZone),
        authoredFlowerShadePass('ambient-contour', 'ambient-contour', false, 59, ambientContour),
      ] : []),
      ...(shade.highlightIntensity > 0 ? [
        authoredFlowerShadePass('rim-light', 'rim-light', true, 23, rimLight),
      ] : []),
    ],
  }
}

function addFlowerCastShadow(
  layer: DrawableLayer,
  sourceLayerOffset: number,
  offsetX: number,
  offsetY: number,
  shade: FlowerOrnamentShadeProfileV0,
) {
  const basePass = layer.inner?.shadePasses?.find((pass) => pass.role === 'core-shadow')
  const shadePasses = layer.inner?.shadePasses
  if (!shadePasses || !basePass) return
  const castPass: InnerShaderPassConfig = {
    ...basePass,
    angle: round(basePass.angle + 10),
    offset: round(Math.max(5, basePass.offset * 0.72)),
    intensity: round(Math.max(0.05, basePass.intensity * shade.castIntensity)),
    style: 'dry',
    coverage: Math.min(0.72, Math.max(0.18, (basePass.coverage ?? 0.58) * 0.74)),
    textureScale: round(Math.max(0.35, (basePass.textureScale ?? 1) * 0.82)),
    fieldSoftness: Math.min(1, (basePass.fieldSoftness ?? 0.6) + 0.12),
    densityEdge: Math.max(0.24, (basePass.densityEdge ?? 0.6) * 0.62),
    densityFalloff: Math.min(1, (basePass.densityFalloff ?? 0.5) + 0.18),
    markSet: undefined,
  }
  shadePasses.splice(
    1,
    0,
    authoredFlowerShadePass('cast-shadow', 'cast-shadow', false, 89, castPass, { sourceLayerOffset, offsetX, offsetY }),
  )
}

function flowerShadePassConfig(shade: FlowerOrnamentShadeProfileV0, overrides: Partial<InnerShaderPassConfig>): InnerShaderPassConfig {
  return {
    angle: 0,
    offset: 8,
    intensity: shade.shadowIntensity,
    style: shade.markStyle,
    spread: 0.42,
    textureScale: shade.textureScale,
    contourAlign: shade.contourAlign,
    coverage: 0.52,
    fieldSoftness: shade.fieldSoftness,
    densityEdge: 0.58,
    densityFalloff: 0.58,
    sizeFalloff: 0.52,
    ...overrides,
  }
}

function authoredFlowerShadePass(
  id: string,
  role: InnerShaderPassRole,
  lit: boolean,
  seedOffset: number,
  config: InnerShaderPassConfig,
  fieldInputs?: InnerShaderPassFieldInputs,
): InnerShaderPipelinePass {
  return {
    ...config,
    id,
    role,
    lit,
    markBudget: drawableShadePassMarkBudgetV0(config),
    seedOffset,
    ...(fieldInputs ? { fieldInputs } : {}),
    cacheKeyContribution: `flower-${id}:${role}`,
  }
}

function layerEdge(edge: EdgeShaderConfig, index: number): EdgeShaderConfig {
  return {
    ...edge,
    fiberAngle: round(edge.fiberAngle + index * 3),
    clusterScale: round(edge.clusterScale + (index % 3) * 0.04),
    detailScale: round(edge.detailScale + (index % 2) * 0.03),
  }
}

function ellipsePoints(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angleDeg: number,
  count: number,
  pinch: number,
): DrawablePoint[] {
  const angle = angleDeg * Math.PI / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return Array.from({ length: count }, (_, index) => {
    const t = index / count * Math.PI * 2
    const tapered = 1 - pinch * Math.cos(t)
    const x = Math.cos(t) * rx * tapered
    const y = Math.sin(t) * ry
    return {
      x: round(cx + x * cos - y * sin),
      y: round(cy + x * sin + y * cos),
    }
  })
}

function bloomPoints(points: DrawablePoint[], center: DrawablePoint, scale: number, rotateDeg: number): DrawablePoint[] {
  const rotate = rotateDeg * Math.PI / 180
  const cos = Math.cos(rotate)
  const sin = Math.sin(rotate)
  return points.map((point) => {
    const dx = (point.x - center.x) * scale
    const dy = (point.y - center.y) * scale
    return {
      x: round(center.x + dx * cos - dy * sin),
      y: round(center.y + dx * sin + dy * cos),
    }
  })
}

function validViewBox(value: unknown): value is [number, number] {
  return Array.isArray(value) &&
    value.length === 2 &&
    value.every((item) => typeof item === 'number' && Number.isFinite(item) && item > 0)
}

function cleanInteger(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.round(numeric) : fallback
}

function cleanDuration(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : fallback
}

function cleanNumber(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? round(numeric) : fallback
}

function cleanPositive(value: unknown, fallback: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? round(numeric) : fallback
}

function cleanRange(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? Math.max(min, Math.min(max, round(numeric))) : fallback
}

function cleanString(value: unknown, fallback: string): string {
  const string = typeof value === 'string' ? value.trim() : ''
  return string || fallback
}

function cleanIdentifier(value: unknown, fallback: string): string {
  const string = cleanString(value, fallback).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-')
  return string || fallback
}

function cleanColor(value: unknown, fallback: string): string {
  const color = typeof value === 'string' ? value.trim() : ''
  return /^#[0-9a-f]{6}$/iu.test(color) ? color.toLowerCase() : fallback
}

function cleanReducedMotion(value: unknown): MorphRuntimeReducedMotionFallbackV0 {
  return value === 'static' || value === 'first-frame' || value === 'freeze' || value === 'none'
    ? value
    : DEFAULT_MOTION.reducedMotion
}

function cleanBoil(value: unknown): MorphRuntimeBoilModeV0 {
  return value === 'always' || value === 'active-only' || value === 'off' ? value : DEFAULT_SETTINGS.boil
}

function cleanMarkStyle(value: unknown): InnerShaderMarkStyle {
  return MARK_STYLES.includes(value as InnerShaderMarkStyle) ? value as InnerShaderMarkStyle : DEFAULT_SHADE.markStyle
}

function cleanEdge(edge: Partial<EdgeShaderConfig> | undefined): Partial<EdgeShaderConfig> {
  if (!edge || typeof edge !== 'object') return {}
  const cleaned: Partial<EdgeShaderConfig> = {}
  for (const key of Object.keys(DEFAULT_EDGE) as Array<keyof EdgeShaderConfig>) {
    const value = edge[key]
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    cleaned[key] = key === 'fiberAngle' ? round(value) as never : Math.max(0, round(value)) as never
  }
  return cleaned
}

function cleanRibbonPoints(points: StrokePoint[] | undefined, fallback: StrokePoint[]): StrokePoint[] {
  const source = points && points.length >= 2 ? points : fallback
  return source
    .map((point) => ({
      x: cleanNumber(point.x, 0),
      y: cleanNumber(point.y, 0),
      w: cleanPositive(point.w, 7),
    }))
    .filter((point) => point.x || point.y)
}

function round(value: number): number {
  return Math.round(value * 10 ** DECIMALS) / 10 ** DECIMALS
}
