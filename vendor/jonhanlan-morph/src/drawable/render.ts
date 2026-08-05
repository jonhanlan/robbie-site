/**
 * Drawable Scene renderer — pure and framework-agnostic.
 *
 * Given a DrawableScene it returns SVG inner markup (a `<defs>` block plus one
 * `<g class="dl-layer">` per layer), reusing the Morph-owned geometry core and
 * hand-drawn edge engine.
 *
 * This is the single render path: the site mounts it directly, and the static lab
 * loads the same code via a bundle — so the live render and the lab preview cannot
 * drift apart. No DOM, no React; output is an SVG markup string usable anywhere.
 */
import type { DrawableScene, DrawableLayer, DrawableLayerTransform, DrawablePoint, EdgeShaderConfig, GeometryPrimitive, ImageFillConfig, StrokePoint } from './types'
import {
  alignClosedPathToReference,
  densifyClosedPath,
  lerpNumber,
  morphPointSets,
  resampleClosedPath,
  smoothClosedPathD,
  type MorphPoint,
} from '../geometry/morph-core'
import {
  edgeDecorations,
  handDrawnContour,
  resolveHandDrawnMorphEdgeStyle,
  HAND_DRAWN_MORPH_BASE_SEED,
  HAND_DRAWN_MORPH_OUTPUT_POINTS,
} from '../hand-drawn-morph-engine'
import * as FieldEngine from './field-engine'
import { resolveMorphFieldMarkSampleV0, type MorphFieldMarkKindV0 } from './field-mark-grammar'
import { resolveDrawableContourField } from './field-resolver'
import { resolveDrawableShadePassPipelineV0, type ResolvedDrawableShadePassV0 } from './shade-pipeline'
import type { MorphRuntimeDocumentV0, MorphRuntimeFieldCacheV0 } from './runtime-contract'

// Matches the lab's per-scene seed base (BASE_SEED + 17) so texture is identical.
const SCENE_SEED = HAND_DRAWN_MORPH_BASE_SEED + 17

type Bounds = { minX: number; minY: number; maxX: number; maxY: number; cx: number; cy: number; w: number; h: number }
type CachedLayerMarkup = { defs: string; markup: string }
type CachedLayerGeometry = { key: string; core: MorphPoint[]; body: string; bounds: Bounds }
type CachedShadePass = { markup: string; circles: number; dotBatches: number; lines: number; lineBatches: number; marks: number; candidates: number }
type DotPathBucket = { count: number; d: string; opacity: number; strokeWidth: number }
type LinePathBucket = { count: number; d: string; opacity: number; strokeWidth: number }
type ShadePassConfig = FieldEngine.ShadePassConfig
type ContourField = FieldEngine.ContourField
type RenderShadePass = ResolvedDrawableShadePassV0

export type DrawableRenderStats = {
  layers: number
  layerCacheHits: number
  layerCacheMisses: number
  geometryCacheHits: number
  geometryCacheMisses: number
  contourFieldCacheHits: number
  contourFieldCacheMisses: number
  runtimeFieldCacheHits: number
  runtimeFieldCacheMisses: number
  shadeCacheHits: number
  shadeCacheMisses: number
  shadeCandidates: number
  shadeMarks: number
  circles: number
  dotBatches: number
  lines: number
  lineBatches: number
}

export type DrawableRenderCache = {
  layers: Map<string, CachedLayerMarkup>
  geometry: Map<string, CachedLayerGeometry>
  contourFields: Map<string, ContourField>
  shade: Map<string, CachedShadePass>
  maxEntries: number
}

export type DrawableRenderPointComposer = (
  points: DrawablePoint[],
  layer: DrawableLayer,
  options?: DrawableRenderOptions,
) => DrawablePoint[]

export type DrawableRenderOptions = {
  f?: string | null
  state?: string
  progress?: number
  composeKey?: string
  composePoints?: DrawableRenderPointComposer
  frame?: number
  /** Monotonic render time used to bucket edge boil at the authored jitter FPS. */
  timeMs?: number
  cache?: DrawableRenderCache
  fieldCache?: MorphRuntimeFieldCacheV0
  stats?: DrawableRenderStats
  authoringPreview?: boolean
}

export function createDrawableRenderStats(): DrawableRenderStats {
  return {
    layers: 0,
    layerCacheHits: 0,
    layerCacheMisses: 0,
    geometryCacheHits: 0,
    geometryCacheMisses: 0,
    contourFieldCacheHits: 0,
    contourFieldCacheMisses: 0,
    runtimeFieldCacheHits: 0,
    runtimeFieldCacheMisses: 0,
    shadeCacheHits: 0,
    shadeCacheMisses: 0,
    shadeCandidates: 0,
    shadeMarks: 0,
    circles: 0,
    dotBatches: 0,
    lines: 0,
    lineBatches: 0,
  }
}

export function createDrawableRenderCache(maxEntries = 180): DrawableRenderCache {
  return {
    layers: new Map(),
    geometry: new Map(),
    contourFields: new Map(),
    shade: new Map(),
    maxEntries,
  }
}

function bounds(points: MorphPoint[]): Bounds {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of points) {
    if (p.x < minX) minX = p.x
    if (p.x > maxX) maxX = p.x
    if (p.y < minY) minY = p.y
    if (p.y > maxY) maxY = p.y
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY }
}

function expandBounds(b: Bounds, pad: number): Bounds {
  const minX = b.minX - pad
  const minY = b.minY - pad
  const maxX = b.maxX + pad
  const maxY = b.maxY + pad
  return { minX, minY, maxX, maxY, cx: b.cx, cy: b.cy, w: maxX - minX, h: maxY - minY }
}

// Deterministic unit noise — identical to the lab + engine so grain matches.
function seededUnit(i: number, seedShift = 0) {
  const noise = Math.sin(i * 12.9898 + seedShift) * 43758.5453
  return noise - Math.floor(noise)
}

function contourNoise(t: number, seed = 0) {
  return (
    Math.sin(t * Math.PI * 2 * 1.1 + seed * 0.37) * 0.52 +
    Math.sin(t * Math.PI * 2 * 2.4 + seed * 0.61) * 0.32 +
    Math.sin(t * Math.PI * 2 * 5.8 + seed * 0.83) * 0.14
  )
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function stableJson(value: unknown) {
  return JSON.stringify(value ?? null)
}

function svgNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(3).replace(/\.?0+$/, '')
}

function imageFillMarkup(image: ImageFillConfig, b: Bounds, clipId: string, fallbackOpacity = 1) {
  return `<image href="${image.href}" x="${svgNumber(image.x ?? b.minX)}" y="${svgNumber(image.y ?? b.minY)}" width="${svgNumber(image.width ?? b.w)}" height="${svgNumber(image.height ?? b.h)}" preserveAspectRatio="${image.preserveAspectRatio ?? 'xMidYMid slice'}" opacity="${svgNumber(fallbackOpacity)}" clip-path="url(#${clipId})"/>`
}

function transformMarkup(transform?: DrawableLayerTransform) {
  if (!transform) return ''
  const tx = transform.tx ?? 0
  const ty = transform.ty ?? 0
  const scale = transform.scale ?? 1
  const rotate = transform.rotate ?? 0
  if (!tx && !ty && scale === 1 && !rotate) return ''

  const parts: string[] = []
  if (tx || ty) parts.push(`translate(${svgNumber(tx)} ${svgNumber(ty)})`)
  if (rotate || scale !== 1) {
    const origin = transform.origin
    if (origin) parts.push(`translate(${svgNumber(origin.x)} ${svgNumber(origin.y)})`)
    if (rotate) parts.push(`rotate(${svgNumber(rotate)})`)
    if (scale !== 1) parts.push(`scale(${svgNumber(scale)})`)
    if (origin) parts.push(`translate(${svgNumber(-origin.x)} ${svgNumber(-origin.y)})`)
  }
  return parts.join(' ')
}

function wrapLayerMarkup(idx: number, body: string, transform?: DrawableLayerTransform) {
  const t = transformMarkup(transform)
  const transformAttr = t ? ` transform="${t}"` : ''
  return `<g class="dl-layer" data-idx="${idx}"${transformAttr}>${body}</g>`
}

function pointsKey(points: DrawablePoint[] | MorphPoint[]) {
  return points.map((p) => `${p.x.toFixed(3)},${p.y.toFixed(3)}`).join(';')
}

function remember<K, V>(map: Map<K, V>, key: K, value: V, maxEntries: number) {
  map.set(key, value)
  if (map.size > maxEntries) {
    const oldest = map.keys().next().value
    if (oldest !== undefined) map.delete(oldest)
  }
  return value
}

function activeRenderCache(options?: DrawableRenderOptions): DrawableRenderCache | undefined {
  const cache = options?.cache
  if (!cache) return undefined
  cache.layers ??= new Map()
  cache.geometry ??= new Map()
  cache.contourFields ??= new Map()
  cache.shade ??= new Map()
  cache.maxEntries = Math.max(1, cache.maxEntries || 180)
  return cache
}

const DOT_OPACITY_BUCKETS = 16
const DOT_RADIUS_BUCKETS_PER_UNIT = 4
const LINE_OPACITY_BUCKETS = 16
const LINE_WEIGHT_BUCKETS_PER_UNIT = 4

function dotPath(x: number, y: number) {
  return `M${x.toFixed(1)} ${y.toFixed(1)}h0.01`
}

function addDotPathBucket(buckets: Map<string, { count: number; d: string; opacityBucket: number; radiusBucket: number }>, x: number, y: number, r: number, opacity = 1) {
  const opacityBucket = Math.max(1, Math.min(DOT_OPACITY_BUCKETS, Math.round(clamp01(opacity) * DOT_OPACITY_BUCKETS)))
  const radiusBucket = Math.max(1, Math.round(Math.max(0.05, r) * DOT_RADIUS_BUCKETS_PER_UNIT))
  const key = `${opacityBucket}|${radiusBucket}`
  const current = buckets.get(key) ?? { count: 0, d: '', opacityBucket, radiusBucket }
  current.count++
  current.d += dotPath(x, y)
  buckets.set(key, current)
}

function dotBucketsMarkup(buckets: Map<string, { count: number; d: string; opacityBucket: number; radiusBucket: number }>) {
  return [...buckets.entries()]
    .sort(([, a], [, b]) => a.opacityBucket - b.opacityBucket || a.radiusBucket - b.radiusBucket)
    .map(([, value]) => ({
      count: value.count,
      d: value.d,
      opacity: value.opacityBucket / DOT_OPACITY_BUCKETS,
      strokeWidth: (value.radiusBucket / DOT_RADIUS_BUCKETS_PER_UNIT) * 2,
    }))
}

function linePath(x1: number, y1: number, x2: number, y2: number) {
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function addLinePathBucket(buckets: Map<string, { count: number; d: string; opacityBucket: number; weightBucket: number }>, x1: number, y1: number, x2: number, y2: number, weight: number, opacity = 1) {
  const opacityBucket = Math.max(1, Math.min(LINE_OPACITY_BUCKETS, Math.round(clamp01(opacity) * LINE_OPACITY_BUCKETS)))
  const weightBucket = Math.max(1, Math.round(Math.max(0.05, weight) * LINE_WEIGHT_BUCKETS_PER_UNIT))
  const key = `${opacityBucket}|${weightBucket}`
  const current = buckets.get(key) ?? { count: 0, d: '', opacityBucket, weightBucket }
  current.count++
  current.d += linePath(x1, y1, x2, y2)
  buckets.set(key, current)
}

function lineBucketsMarkup(buckets: Map<string, { count: number; d: string; opacityBucket: number; weightBucket: number }>): LinePathBucket[] {
  return [...buckets.entries()]
    .sort(([, a], [, b]) => a.opacityBucket - b.opacityBucket || a.weightBucket - b.weightBucket)
    .map(([, value]) => ({
      count: value.count,
      d: value.d,
      opacity: value.opacityBucket / LINE_OPACITY_BUCKETS,
      strokeWidth: value.weightBucket / LINE_WEIGHT_BUCKETS_PER_UNIT,
    }))
}

function grainFieldMarkup(b: Bounds, amount: number, seed: number) {
  const count = Math.max(0, Math.round(amount * 320))
  const buckets = new Map<string, { count: number; d: string; opacityBucket: number; radiusBucket: number }>()
  for (let k = 0; k < count; k++) {
    const x = b.minX + seededUnit(k * 7.3, seed + 11) * b.w
    const y = b.minY + seededUnit(k * 9.7, seed + 29) * b.h
    const r = 0.4 + seededUnit(k * 4.1, seed + 53) * 1.2
    addDotPathBucket(buckets, x, y, r)
  }
  return dotBucketsMarkup(buckets)
    .map((bucket) => `<path data-dots="${bucket.count}" d="${bucket.d}" opacity="${bucket.opacity.toFixed(3)}" stroke-width="${bucket.strokeWidth.toFixed(2)}"/>`)
    .join('')
}

function hatchLinesMarkup(b: Bounds, spacing: number) {
  const pad = Math.max(b.w, b.h)
  const step = Math.max(2, spacing)
  let d = ''
  let count = 0
  for (let y = b.cy - pad; y <= b.cy + pad; y += step) {
    d += linePath(b.cx - pad, y, b.cx + pad, y)
    count++
  }
  return `<path data-lines="${count}" d="${d}"/>`
}

function blendedAngle(base: number, target: number, amount: number) {
  const bx = Math.cos(base)
  const by = Math.sin(base)
  const tx = Math.cos(target)
  const ty = Math.sin(target)
  return Math.atan2(by * (1 - amount) + ty * amount, bx * (1 - amount) + tx * amount)
}

function formShadeTextureMarkup(core: MorphPoint[], field: ContourField, b: Bounds, pass: ShadePassConfig, seed: number, lit: boolean, options?: DrawableRenderOptions) {
  const style = pass.style === 'halftone' ? 'dots' : pass.style || 'dots'
  const intensity = clamp01(pass.intensity ?? 0.4)
  const textureScale = Math.max(0.35, Math.min(2.5, pass.textureScale ?? 1))
  const jitter = clamp01(pass.jitter ?? 0)
  const contourAlign = clamp01(pass.contourAlign ?? 0.8)
  const stateDensity = pass.markState && options?.state ? 1 + ((pass.markState[options.state] ?? 1) - 1) * clamp01(options?.progress ?? 0) : 1
  const warp = Math.max(0, Math.min(1.5, pass.warp ?? 0))
  const densityFalloff = clamp01(pass.densityFalloff ?? 0)
  const sizeFalloff = clamp01(pass.sizeFalloff ?? 0)
  const side = FieldEngine.shadeFieldSide(pass)
  const maxDist = FieldEngine.shadeMaxDist(b, pass)
  const densityBoost = Math.max(0.45, Math.min(1.6, 0.72 + intensity * 0.9))
  const step = Math.max(3.5, (style === 'grain' ? 5.2 : 8.4) * textureScale / densityBoost)
  const jitterAmp = Math.max(jitter * textureScale * 3.2, step * (0.2 + densityFalloff * 0.42 + sizeFalloff * 0.22))
  const outsidePad = side === 'inside' ? 0 : maxDist * (0.36 + (pass.fieldSoftness ?? 0.42) * 0.52 + (pass.spread ?? 0.6) * 0.22)
  const sampleBounds = outsidePad > 0 ? expandBounds(b, outsidePad) : b
  const dotBuckets = new Map<string, { count: number; d: string; opacityBucket: number; radiusBucket: number }>()
  const lineBuckets = new Map<string, { count: number; d: string; opacityBucket: number; weightBucket: number }>()
  let k = 0
  let candidates = 0
  let circles = 0
  let dotBatches = 0
  let lineCount = 0
  let lineBatches = 0
  for (let yy = sampleBounds.minY - step; yy <= sampleBounds.maxY + step; yy += step) {
    for (let xx = sampleBounds.minX - step; xx <= sampleBounds.maxX + step; xx += step) {
      k++
      const x = xx + (seededUnit(k * 5.9, seed + 103) - 0.5) * jitterAmp
      const y = yy + (seededUnit(k * 6.7, seed + 127) - 0.5) * jitterAmp
      candidates++
      const fieldA = contourNoise((x + y) * 0.006, seed + 211)
      const fieldB = contourNoise((x - y) * 0.005, seed + 229)
      const wx = x + fieldA * warp * step * 0.85
      const wy = y + fieldB * warp * step * 0.85
      const frame = FieldEngine.contourFrameAt(wx, wy, core, field)
      if (!FieldEngine.fieldSideAllows(frame.inside, side)) continue
      const sample = FieldEngine.fieldSampleAt(frame, b, pass, (fieldA + fieldB) * 0.5, lit)
      if (sample.fieldStrength <= 0.00035) continue
      const cornerWeight = sample.cornerFalloff01
      const pathGrain = 0.87 + contourNoise(frame.pathT, seed + 307) * 0.13
      const grainBreakup = 0.78 + seededUnit(k * 2.3, seed + 379) * 0.44
      const mark = resolveMorphFieldMarkSampleV0(sample, {
        kind: style,
        density: cornerWeight * pathGrain * grainBreakup * stateDensity,
        size: textureScale,
        angleDeg: (pass.angle || 0) + 90,
        jitter,
        contourAlign,
      })
      if (!mark.keep) continue
      const keep = FieldEngine.densityKeepAmount(mark.density01, sample.fieldStrength, densityFalloff)
      if (densityFalloff > 0 && seededUnit(k * 8.9, seed + 197) > keep) continue
      if (style === 'grain' && seededUnit(k * 3.1, seed + 71) > Math.pow(mark.density01, 0.88 + densityFalloff * 0.72)) continue
      if (mark.length > 0) {
        if (seededUnit(k * 4.7, seed + 31) > Math.min(1, mark.density01 * 1.18 * keep)) continue
        const tangentAng = Math.atan2(frame.ty, frame.tx)
        const ang = blendedAngle(mark.angleRad, tangentAng, contourAlign)
        const len = step * mark.length
        const sw = (0.55 + mark.density01 * 1.1) * Math.sqrt(textureScale) * (0.58 + mark.size * 0.42)
        const drawLine = (a: number) => {
          const dx = Math.cos(a) * len * 0.5
          const dy = Math.sin(a) * len * 0.5
          addLinePathBucket(lineBuckets, x - dx, y - dy, x + dx, y + dy, sw, mark.opacity)
          lineCount++
        }
        drawLine(ang)
        if (style === 'cross' && mark.secondaryAngleRad && mark.density01 > 0.38) drawLine(mark.secondaryAngleRad)
      } else {
        const grain = style === 'grain'
        const r = (grain ? 0.28 + seededUnit(k * 4.1, seed + 53) * 0.55 : 0.35 + Math.pow(mark.density01, 0.85) * 2.25) * mark.size
        addDotPathBucket(dotBuckets, x, y, r, mark.opacity)
        circles++
      }
    }
  }
  const dotPaths = dotBucketsMarkup(dotBuckets)
  dotBatches = dotPaths.length
  const linePaths = lineBucketsMarkup(lineBuckets)
  lineBatches = linePaths.length
  return { dotPaths, linePaths, circles, dotBatches, lineBatches, lineCount, candidates, marks: circles + lineCount }
}

function shadePass(
  clipId: string,
  core: MorphPoint[],
  b: Bounds,
  pass: ShadePassConfig,
  lit: boolean,
  seed: number,
  options: DrawableRenderOptions | undefined,
  geometryKey: string,
) {
  if (pass.markSet?.length) {
    let markup = ''
    for (const mark of pass.markSet) {
      markup += shadePass(clipId, core, b, {
        ...pass,
        style: mark[0],
        densityEdge: (pass.densityEdge ?? 1) * (mark[1] ?? 1),
        textureScale: (pass.textureScale ?? 1) * (mark[2] ?? 1),
        markSet: undefined,
      }, lit, seed, options, geometryKey).markup
    }
    return { markup } as CachedShadePass
  }
  const rgb = lit ? '255,255,255' : '0,0,0'
  const cache = activeRenderCache(options)
  const stats = options?.stats
  const cacheKey = `${clipId}|${geometryKey}|${lit ? 'lit' : 'shade'}|${seed}|${stableJson(pass)}`
  if (cache) {
    const cached = cache.shade.get(cacheKey)
    if (cached) {
      if (stats) {
        stats.shadeCacheHits++
        stats.shadeCandidates += cached.candidates
        stats.shadeMarks += cached.marks
        stats.circles += cached.circles
        stats.dotBatches += cached.dotBatches
        stats.lines += cached.lines
        stats.lineBatches += cached.lineBatches
      }
      return cached
    }
  }
  if (stats) stats.shadeCacheMisses++
  const field = resolveDrawableContourField(core, geometryKey, options)
  const tex = formShadeTextureMarkup(core, field, b, pass, seed, lit, options)
  const clipAttr = FieldEngine.shadeFieldSide(pass) === 'inside' ? ` clip-path="url(#${clipId})"` : ''
  let markup = ''
  if (tex.dotPaths.length) {
    const paths = tex.dotPaths
      .map((bucket: DotPathBucket) => `<path data-dots="${bucket.count}" d="${bucket.d}" opacity="${bucket.opacity.toFixed(3)}" stroke-width="${bucket.strokeWidth.toFixed(2)}"/>`)
      .join('')
    markup += `<g${clipAttr} stroke="rgba(${rgb},${lit ? 0.44 : 0.5})" stroke-linecap="round" fill="none">${paths}</g>`
  }
  if (tex.linePaths.length) {
    const paths = tex.linePaths
      .map((bucket: LinePathBucket) => `<path data-lines="${bucket.count}" d="${bucket.d}" opacity="${bucket.opacity.toFixed(3)}" stroke-width="${bucket.strokeWidth.toFixed(2)}"/>`)
      .join('')
    markup += `<g${clipAttr} stroke="rgba(${rgb},${lit ? 0.48 : 0.58})" stroke-linecap="round" fill="none">${paths}</g>`
  }
  const result = { markup, circles: tex.circles, dotBatches: tex.dotBatches, lines: tex.lineCount, lineBatches: tex.lineBatches, marks: tex.marks, candidates: tex.candidates }
  if (stats) {
    stats.shadeCandidates += result.candidates
    stats.shadeMarks += result.marks
    stats.circles += result.circles
    stats.dotBatches += result.dotBatches
    stats.lines += result.lines
    stats.lineBatches += result.lineBatches
  }
  return cache ? remember(cache.shade, cacheKey, result, cache.maxEntries) : result
}

function layerGeometryPoints(layer: DrawableLayer, options?: DrawableRenderOptions): DrawablePoint[] {
  if (layer.geometry.kind !== 'closed') return []
  const rest = layer.geometry.points
  const progress = clamp01(options?.progress ?? 0)
  const fromPoints = (options?.f ? (layer.states?.[options.f] as { points?: DrawablePoint[] } | undefined)?.points : undefined) ?? rest
  const target = options?.state && layer.states?.[options.state]
  if (!target || target.kind !== 'closed' || target.points.length < 3 || progress <= 0) {
    return options?.composePoints ? options.composePoints(fromPoints, layer, options) : fromPoints
  }
  let base: DrawablePoint[]
  if (target.points.length === fromPoints.length) {
    const to = alignClosedPathToReference(target.points, fromPoints)
    base = morphPointSets(fromPoints, to, progress)
  } else {
    const from = resampleClosedPath(fromPoints, layer.resolution ?? fromPoints.length)
    const to = alignClosedPathToReference(resampleClosedPath(target.points, from.length), from)
    base = morphPointSets(from, to, progress)
  }
  return options?.composePoints ? options.composePoints(base, layer, options) : base
}

function layerRibbonStrokes(layer: DrawableLayer, options?: DrawableRenderOptions): StrokePoint[][] {
  if (layer.geometry.kind !== 'ribbon') return []
  const rest = layer.geometry
  const fromState = options?.f ? layer.states?.[options.f] : undefined
  const targetState = options?.state ? layer.states?.[options.state] : undefined
  const from = isRibbonGeometry(fromState)
    ? fromState
    : rest
  const target = isRibbonGeometry(targetState)
    ? targetState
    : undefined
  const progress = clamp01(options?.progress ?? 0)
  const revealProgress = ribbonWriteOnProgress(layer, options)
  const strokes = !target || progress <= 0
    ? from.strokes
    : progress >= 1
      ? target.strokes
      : interpolateRibbonStrokes(from.strokes, target.strokes, progress) ?? target.strokes
  return revealProgress >= 1 ? strokes : strokes.map((stroke) => trimRibbonStrokeForWriteOn(stroke, revealProgress))
}

export function resolveDrawableLayerPlaybackGeometry(
  layer: DrawableLayer,
  options?: DrawableRenderOptions,
): GeometryPrimitive {
  if (layer.geometry.kind === 'ribbon') {
    return { ...layer.geometry, strokes: layerRibbonStrokes(layer, options) }
  }
  if (layer.geometry.kind === 'closed') {
    return { ...layer.geometry, points: layerGeometryPoints(layer, options) }
  }
  return layer.geometry
}

function isRibbonGeometry(value: GeometryPrimitive | undefined): value is Extract<GeometryPrimitive, { kind: 'ribbon' }> {
  return value?.kind === 'ribbon'
}

function ribbonWriteOnProgress(layer: DrawableLayer, options?: DrawableRenderOptions): number {
  if (!options?.state) return 1
  const motion = layer.motion?.find((entry) => entry.style === 'write-on' && entry.to === options.state)
  if (!motion) return 1
  return clamp01(options.progress ?? 0)
}

function trimRibbonStrokeForWriteOn(points: StrokePoint[], progress: number): StrokePoint[] {
  if (progress >= 1) return points
  if (progress <= 0 || points.length < 2) return []

  const stops = ribbonWriteOnStops(points)
  const result: StrokePoint[] = [points[0]!]
  for (let index = 1; index < points.length; index += 1) {
    const stop = stops[index] ?? 0
    if (stop < progress) {
      result.push(points[index]!)
      continue
    }
    const previousStop = stops[index - 1] ?? 0
    const span = Math.max(0.0001, stop - previousStop)
    const local = clamp01((progress - previousStop) / span)
    const previous = points[index - 1]!
    const current = points[index]!
    result.push(interpolateStrokePoint(previous, current, local))
    break
  }
  return result.length >= 2 ? result : []
}

function ribbonWriteOnStops(points: StrokePoint[]): number[] {
  const timed = points.every((point) => Number.isFinite(point.t))
  if (timed) {
    const start = points[0]?.t ?? 0
    const end = points[points.length - 1]?.t ?? start
    const span = Math.max(0.0001, end - start)
    return points.map((point) => clamp01(((point.t ?? start) - start) / span))
  }

  const distances = [0]
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]!
    const current = points[index]!
    distances[index] = distances[index - 1]! + Math.hypot(current.x - previous.x, current.y - previous.y)
  }
  const total = Math.max(0.0001, distances[distances.length - 1] ?? 0)
  return distances.map((distance) => clamp01(distance / total))
}

function interpolateStrokePoint(from: StrokePoint, to: StrokePoint, progress: number): StrokePoint {
  const point: StrokePoint = {
    x: lerpNumber(from.x, to.x, progress),
    y: lerpNumber(from.y, to.y, progress),
  }
  if (Number.isFinite(from.w) || Number.isFinite(to.w)) point.w = lerpNumber(from.w ?? to.w ?? 2.6, to.w ?? from.w ?? 2.6, progress)
  if (Number.isFinite(from.t) || Number.isFinite(to.t)) point.t = lerpNumber(from.t ?? to.t ?? 0, to.t ?? from.t ?? 0, progress)
  return point
}

function interpolateRibbonStrokes(from: StrokePoint[][], to: StrokePoint[][], progress: number): StrokePoint[][] | null {
  if (from.length !== to.length) return null
  const strokes: StrokePoint[][] = []
  for (let strokeIndex = 0; strokeIndex < from.length; strokeIndex += 1) {
    const fromStroke = from[strokeIndex] ?? []
    const toStroke = to[strokeIndex] ?? []
    if (fromStroke.length !== toStroke.length) return null
    strokes.push(fromStroke.map((point, pointIndex) => {
      const target = toStroke[pointIndex]!
      const next: StrokePoint = {
        x: lerpNumber(point.x, target.x, progress),
        y: lerpNumber(point.y, target.y, progress),
      }
      if (Number.isFinite(point.w) && Number.isFinite(target.w)) next.w = lerpNumber(point.w as number, target.w as number, progress)
      else if (Number.isFinite(point.w)) next.w = point.w
      else if (Number.isFinite(target.w)) next.w = target.w
      if (Number.isFinite(point.t) && Number.isFinite(target.t)) next.t = lerpNumber(point.t as number, target.t as number, progress)
      else if (Number.isFinite(point.t)) next.t = point.t
      else if (Number.isFinite(target.t)) next.t = target.t
      return next
    }))
  }
  return strokes
}

function ribbonStrokeOutline(points: StrokePoint[], style?: { cap?: 'round' | 'butt' | 'square'; join?: 'round' | 'bevel' | 'miter'; taper?: { start?: number; end?: number } }): DrawablePoint[] {
  const left: DrawablePoint[] = []
  const right: DrawablePoint[] = []
  const last = Math.max(1, points.length - 1)
  const cap = style?.cap ?? 'butt'
  const join = style?.join ?? 'round'
  const startTaper = clamp01(style?.taper?.start ?? 0)
  const endTaper = clamp01(style?.taper?.end ?? 0)
  let startCap: { x: number; y: number; nx: number; ny: number; radius: number } | undefined
  let endCap: { x: number; y: number; nx: number; ny: number; radius: number } | undefined
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[Math.max(0, index - 1)]!
    const current = points[index]!
    const next = points[Math.min(points.length - 1, index + 1)]!
    const inDx = index === 0 ? next.x - current.x : current.x - previous.x
    const inDy = index === 0 ? next.y - current.y : current.y - previous.y
    const outDx = index === points.length - 1 ? current.x - previous.x : next.x - current.x
    const outDy = index === points.length - 1 ? current.y - previous.y : next.y - current.y
    const inLength = Math.hypot(inDx, inDy) || 1
    const outLength = Math.hypot(outDx, outDy) || 1
    const inTx = inDx / inLength
    const inTy = inDy / inLength
    const outTx = outDx / outLength
    const outTy = outDy / outLength
    const tx = index === 0 ? outTx : index === points.length - 1 ? inTx : (inTx + outTx) / (Math.hypot(inTx + outTx, inTy + outTy) || 1)
    const ty = index === 0 ? outTy : index === points.length - 1 ? inTy : (inTy + outTy) / (Math.hypot(inTx + outTx, inTy + outTy) || 1)
    const position = index / last
    const taperScale = Math.min(1, (1 - startTaper) + position * startTaper, (1 - endTaper) + (1 - position) * endTaper)
    const width = (Number.isFinite(current.w) && (current.w ?? 0) > 0 ? current.w as number : 2.6) * taperScale
    const radius = width * 0.55 + 0.4
    const squareOffset = cap === 'square' ? radius : 0
    const cx = current.x + (index === 0 ? -tx * squareOffset : index === points.length - 1 ? tx * squareOffset : 0)
    const cy = current.y + (index === 0 ? -ty * squareOffset : index === points.length - 1 ? ty * squareOffset : 0)
    const nx = -ty * radius
    const ny = tx * radius
    if (index === 0) startCap = { x: current.x, y: current.y, nx, ny, radius }
    if (index === points.length - 1) endCap = { x: current.x, y: current.y, nx, ny, radius }
    if (index > 0 && index < points.length - 1 && join === 'bevel') {
      const inNx = -inTy * radius
      const inNy = inTx * radius
      const outNx = -outTy * radius
      const outNy = outTx * radius
      left.push({ x: current.x + inNx, y: current.y + inNy }, { x: current.x + outNx, y: current.y + outNy })
      right.push({ x: current.x - inNx, y: current.y - inNy }, { x: current.x - outNx, y: current.y - outNy })
      continue
    }
    if (index > 0 && index < points.length - 1 && join === 'miter') {
      const inNx = -inTy
      const inNy = inTx
      const outNx = -outTy
      const outNy = outTx
      const mx = inNx + outNx
      const my = inNy + outNy
      const mLength = Math.hypot(mx, my) || 1
      const miterX = mx / mLength
      const miterY = my / mLength
      const miterScale = Math.min(radius * 2.4, radius / Math.max(0.35, Math.abs(miterX * outNx + miterY * outNy)))
      left.push({ x: current.x + miterX * miterScale, y: current.y + miterY * miterScale })
      right.push({ x: current.x - miterX * miterScale, y: current.y - miterY * miterScale })
      continue
    }
    if (index > 0 && index < points.length - 1 && join === 'round') {
      const inNx = -inTy
      const inNy = inTx
      const outNx = -outTy
      const outNy = outTx
      const midNx = inNx + outNx
      const midNy = inNy + outNy
      const midLength = Math.hypot(midNx, midNy) || 1
      const joinX = midNx / midLength
      const joinY = midNy / midLength
      const inJoin = ribbonRoundJoinPoint(inNx, inNy, joinX, joinY)
      const outJoin = ribbonRoundJoinPoint(joinX, joinY, outNx, outNy)
      left.push(
        { x: current.x + inNx * radius, y: current.y + inNy * radius },
        { x: current.x + inJoin.x * radius, y: current.y + inJoin.y * radius },
        { x: current.x + joinX * radius, y: current.y + joinY * radius },
        { x: current.x + outJoin.x * radius, y: current.y + outJoin.y * radius },
        { x: current.x + outNx * radius, y: current.y + outNy * radius },
      )
      right.push(
        { x: current.x - inNx * radius, y: current.y - inNy * radius },
        { x: current.x - inJoin.x * radius, y: current.y - inJoin.y * radius },
        { x: current.x - joinX * radius, y: current.y - joinY * radius },
        { x: current.x - outJoin.x * radius, y: current.y - outJoin.y * radius },
        { x: current.x - outNx * radius, y: current.y - outNy * radius },
      )
      continue
    }
    left.push({
      x: cx + nx,
      y: cy + ny,
    })
    right.push({
      x: cx - nx,
      y: cy - ny,
    })
  }
  if (cap !== 'round' || !startCap || !endCap) return [...left, ...right.reverse()]
  return [
    ...left,
    ...ribbonRoundCapPoints(endCap, 0),
    ...right.reverse(),
    ...ribbonRoundCapPoints(startCap, -Math.PI),
  ]
}

function ribbonRoundJoinPoint(ax: number, ay: number, bx: number, by: number): DrawablePoint {
  const x = ax + bx
  const y = ay + by
  const length = Math.hypot(x, y) || 1
  return { x: x / length, y: y / length }
}

function ribbonRoundCapPoints(cap: { x: number; y: number; nx: number; ny: number; radius: number }, offset: number): DrawablePoint[] {
  const angle = Math.atan2(cap.ny, cap.nx) + offset
  return [1, 2, 3, 4, 5, 6, 7].map((step) => {
    const theta = angle - (Math.PI * step) / 8
    return {
      x: cap.x + Math.cos(theta) * cap.radius,
      y: cap.y + Math.sin(theta) * cap.radius,
    }
  })
}

// Resolve a layer's geometry to the hand-drawn contour the passes paint onto.
function layerContour(points: DrawablePoint[], edge: EdgeShaderConfig, seed: number): MorphPoint[] {
  const dense = resampleClosedPath(densifyClosedPath(points, 6), HAND_DRAWN_MORPH_OUTPUT_POINTS)
  return handDrawnContour(dense, edge.intensity, seed, edge)
}

export function createDrawableLayerRenderSeed(edge: EdgeShaderConfig, idx: number, frame = 0, timeMs?: number) {
  const boil = Math.max(0, edge.boilAmount ?? 1)
  const jitterFps = Math.max(0, edge.jitterFps ?? 0)
  const legacyFrame = Math.floor(Math.max(0, frame) / (edge.fpsDivisor ?? 1))
  const timedFrame = Number.isFinite(timeMs)
    ? Math.floor(Math.max(0, timeMs as number) * jitterFps / 1000)
    : legacyFrame
  const temporalFrame = jitterFps > 0 ? timedFrame : 0
  return SCENE_SEED + idx * 7 + Math.round(temporalFrame * 131 * boil)
}

export function createDrawableLayerGeometryCacheKey(
  layer: DrawableLayer,
  idx: number,
  points: DrawablePoint[],
  edge: EdgeShaderConfig,
  seed: number,
  smoothing: number,
  options?: DrawableRenderOptions,
) {
  return [
    layer.id,
    idx,
    (options?.progress ?? 0) > 0 ? options?.state : '',
    (options?.progress ?? 0).toFixed(4),
    seed,
    smoothing.toFixed(4),
    pointsKey(points),
    stableJson(edge),
  ].join('|')
}

export function createDrawableLayerRenderContour(points: DrawablePoint[], edge: EdgeShaderConfig, seed: number): MorphPoint[] {
  return layerContour(points, edge, seed)
}

export function createDrawableLayerStaticRenderGeometry(layer: DrawableLayer, idx: number, options?: DrawableRenderOptions) {
  const edge = resolveHandDrawnMorphEdgeStyle(layer.edge)
  const seed = createDrawableLayerRenderSeed(edge, idx, options?.frame ?? 0, options?.timeMs)
  const smoothing = layer.smoothing ?? 0.65
  const points = layerGeometryPoints(layer, options)
  const core = layerContour(points, edge, seed)
  return {
    key: createDrawableLayerGeometryCacheKey(layer, idx, points, edge, seed, smoothing, options),
    seed,
    core,
    bounds: bounds(core),
  }
}

function renderInterLayerShadePass(scene: DrawableScene, receiver: DrawableLayer, receiverIdx: number, pass: ResolvedDrawableShadePassV0, options?: DrawableRenderOptions) {
  const input = pass.fieldInputs
  const sourceIdx = receiverIdx + (input?.sourceLayerOffset ?? 0)
  const source = scene.layers[sourceIdx]
  if (!input?.sourceLayerOffset || !source || receiver.geometry.kind !== 'closed' || source.geometry.kind !== 'closed') return { defs: '', markup: '' }
  const receiverEdge = resolveHandDrawnMorphEdgeStyle(receiver.edge)
  const receiverSeed = createDrawableLayerRenderSeed(receiverEdge, receiverIdx, options?.frame ?? 0, options?.timeMs)
  const receiverSmoothing = receiver.smoothing ?? 0.65
  const receiverGeometry = resolveLayerGeometry(receiver, receiverIdx, layerGeometryPoints(receiver, options), receiverEdge, receiverSeed, receiverSmoothing, options)
  const sourceEdge = resolveHandDrawnMorphEdgeStyle(source.edge)
  const sourceSeed = createDrawableLayerRenderSeed(sourceEdge, sourceIdx, options?.frame ?? 0, options?.timeMs)
  const sourceGeometry = resolveLayerGeometry(source, sourceIdx, layerGeometryPoints(source, options), sourceEdge, sourceSeed, source.smoothing ?? 0.65, options)
  const dx = input.offsetX ?? 0
  const dy = input.offsetY ?? 0
  const projectedCore = dx || dy ? sourceGeometry.core.map((point) => ({ x: point.x + dx, y: point.y + dy })) : sourceGeometry.core
  const clipId = `dl-inter-clip-${receiver.id}-${pass.id}`
  const clipBody = receiverGeometry.body
  const r = shadePass(
    clipId,
    projectedCore,
    bounds(projectedCore),
    pass.pass,
    pass.lit,
    sourceSeed + pass.seedOffset,
    options,
    `${sourceGeometry.key}|${receiverGeometry.key}|${pass.cacheKeyContribution}|${dx.toFixed(3)},${dy.toFixed(3)}`,
  )
  return {
    defs: `<clipPath id="${clipId}"><path d="${clipBody}"/></clipPath>`,
    markup: r.markup,
  }
}

function resolveLayerGeometry(
  layer: DrawableLayer,
  idx: number,
  points: DrawablePoint[],
  edge: EdgeShaderConfig,
  seed: number,
  smoothing: number,
  options?: DrawableRenderOptions,
): CachedLayerGeometry {
  const cache = activeRenderCache(options)
  const stats = options?.stats
  const key = createDrawableLayerGeometryCacheKey(layer, idx, points, edge, seed, smoothing, options)
  if (!cache) {
    if (stats) stats.geometryCacheMisses++
    const core = layerContour(points, edge, seed)
    const body = smoothClosedPathD(core, smoothing)
    return { key, core, body, bounds: bounds(core) }
  }
  const cached = cache.geometry.get(key)
  if (cached) {
    if (stats) stats.geometryCacheHits++
    return cached
  }
  if (stats) stats.geometryCacheMisses++
  const core = layerContour(points, edge, seed)
  const body = smoothClosedPathD(core, smoothing)
  const result = { key, core, body, bounds: bounds(core) }
  return remember(cache.geometry, key, result, cache.maxEntries)
}

function layerMarkupCacheKey(
  layer: DrawableLayer,
  idx: number,
  edge: EdgeShaderConfig,
  seed: number,
  smoothing: number,
  options?: DrawableRenderOptions,
) {
  return [
    layer.id,
    idx,
    options?.state,
    (options?.progress ?? 0).toFixed(4),
    seed,
    smoothing.toFixed(4),
    stableJson(layer.geometry),
    options?.f,
    stableJson(options?.state ? layer.states?.[options.state] : null),
    options?.composeKey,
    options?.authoringPreview ? 'authoring-preview' : '',
    stableJson(edge),
    stableJson(layer.fill),
    stableJson(layer.inner),
    stableJson(layer.passes),
  ].join('|')
}

export function renderDrawableLayer(layer: DrawableLayer, idx: number, options?: DrawableRenderOptions): { defs: string; markup: string } {
  const geom = layer.geometry
  if (geom.kind === 'ribbon') {
    const strokes = layerRibbonStrokes(layer, options)
    const rendered = strokes
      .map((stroke, strokeIndex) => renderDrawableLayer({
        ...layer,
        id: strokeIndex === 0 ? layer.id : `${layer.id}-stroke-${strokeIndex + 1}`,
        geometry: { kind: 'closed', points: ribbonStrokeOutline(stroke, geom.style) },
        states: undefined,
        fill: { ...layer.fill, fillRule: 'nonzero' } as DrawableLayer['fill'],
      }, idx + strokeIndex, options))
      .filter((result) => result.defs || result.markup)
    return {
      defs: rendered.map((result) => result.defs).join(''),
      markup: rendered.map((result) => result.markup).join(''),
    }
  }
  if (geom.kind !== 'closed' || geom.points.length < 3) return { defs: '', markup: '' }
  if (options?.stats) options.stats.layers++

  const edge = resolveHandDrawnMorphEdgeStyle(layer.edge)
  const seed = createDrawableLayerRenderSeed(edge, idx, options?.frame ?? 0, options?.timeMs)
  const smoothing = layer.smoothing ?? 0.65
  const cache = activeRenderCache(options)
  const layerCacheKey = cache ? layerMarkupCacheKey(layer, idx, edge, seed, smoothing, options) : ''
  if (cache) {
    const cached = cache.layers.get(layerCacheKey)
    if (cached) {
      if (options?.stats) options.stats.layerCacheHits++
      return { defs: cached.defs, markup: wrapLayerMarkup(idx, cached.markup, layer.transform) }
    }
  }
  if (options?.stats) options.stats.layerCacheMisses++
  const points = layerGeometryPoints(layer, options)
  const geometry = resolveLayerGeometry(layer, idx, points, edge, seed, smoothing, options)
  const core = geometry.core
  const body = geometry.body
  const b = geometry.bounds
  const fill = layer.fill ?? {}
  const fillRule = (fill as typeof fill & { fillRule?: 'evenodd' | 'nonzero' }).fillRule ?? 'evenodd'
  const inner = layer.inner ?? {}
  const passes = layer.passes ?? {}
  const shadePipeline: RenderShadePass[] = options?.authoringPreview
    ? []
    : resolveDrawableShadePassPipelineV0(inner, passes, FieldEngine.resolveAutoBalancedShades(inner)).filter((pass) => !pass.fieldInputs?.sourceLayerOffset)
  const showFill = passes.fill !== false
  const showEdge = passes.edge !== false
  const showGrain = passes.grain !== false
  const showHatching = passes.hatching !== false
  const clipId = `dl-clip-${layer.id}`
  const imageClipId = `dl-image-clip-${layer.id}`
  const hasImageFill = showFill && typeof fill.image?.href === 'string' && fill.image.href.length > 0
  const hasGrain = showGrain && typeof fill.grain === 'number' && fill.grain > 0
  const hasHatching = showHatching && !!fill.hatching
  const hasClippedShade = shadePipeline.some(({ pass }) => FieldEngine.shadeFieldSide(pass) === 'inside')

  let defs = ''
  let m = ''
  if (hasGrain || hasHatching || hasClippedShade) defs += `<clipPath id="${clipId}"><path d="${body}"/></clipPath>`

  if (hasImageFill && fill.image) {
    const deco = showEdge ? ' ' + edgeDecorations(core, seed, edge) : ''
    defs += `<clipPath id="${imageClipId}"><path d="${(body + deco).trim()}" fill-rule="evenodd"/></clipPath>`
    m += imageFillMarkup(fill.image, b, imageClipId, fill.opacity ?? 1)
    if (showEdge && edge.edgeWeight > 0) {
      const dry = clamp01(edge.dryBrush ?? 0)
      const dash = dry > 0.02 ? ` stroke-dasharray="${(10 - dry * 5).toFixed(2)} ${(3 + dry * 12).toFixed(2)}"` : ''
      m += `<path d="${body}" fill="none" stroke="rgba(0,0,0,${(0.16 + edge.edgeWeight * 0.18).toFixed(3)})" stroke-width="${(0.7 + edge.edgeWeight * 1.65).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`
    }
  } else if (showFill && fill.fill) {
    const deco = showEdge ? ' ' + edgeDecorations(core, seed, edge) : ''
    m += `<path d="${(body + deco).trim()}" fill="${fill.fill}" fill-opacity="${fill.opacity ?? 1}" fill-rule="${fillRule}"/>`
    if (showEdge && edge.edgeWeight > 0) {
      const dry = clamp01(edge.dryBrush ?? 0)
      const dash = dry > 0.02 ? ` stroke-dasharray="${(10 - dry * 5).toFixed(2)} ${(3 + dry * 12).toFixed(2)}"` : ''
      m += `<path d="${body}" fill="none" stroke="rgba(0,0,0,${(0.16 + edge.edgeWeight * 0.18).toFixed(3)})" stroke-width="${(0.7 + edge.edgeWeight * 1.65).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"${dash}/>`
    }
  } else if (showEdge) {
    m += `<path d="${edgeDecorations(core, seed, edge)}" fill="${fill.fill ?? '#1b1b1f'}"/>`
  }

  if (hasGrain) {
    m += `<g clip-path="url(#${clipId})" stroke="rgba(0,0,0,0.2)" stroke-linecap="round" fill="none">${grainFieldMarkup(b, fill.grain as number, seed + 5)}</g>`
  }
  if (hasHatching && fill.hatching) {
    m += `<g clip-path="url(#${clipId})"><g transform="rotate(${fill.hatching.angle} ${b.cx.toFixed(2)} ${b.cy.toFixed(2)})" stroke="rgba(0,0,0,0.22)" stroke-width="${fill.hatching.weight}">${hatchLinesMarkup(b, fill.hatching.spacing)}</g></g>`
  }

  for (const shade of shadePipeline) {
    const r = shadePass(clipId, core, b, shade.pass, shade.lit, seed + shade.seedOffset, options, geometry.key)
    m += r.markup
  }

  const result = { defs, markup: m }
  const cached = cache ? remember(cache.layers, layerCacheKey, result, cache.maxEntries) : result
  return { defs: cached.defs, markup: wrapLayerMarkup(idx, cached.markup, layer.transform) }
}

/** Render a whole scene to SVG inner markup (one `<defs>` + a `<g>` per layer). */
export function renderDrawableScene(scene: DrawableScene, options?: DrawableRenderOptions): string {
  let defs = ''
  let body = ''
  scene.layers.forEach((layer, idx) => {
    const r = renderDrawableLayer(layer, idx, options)
    defs += r.defs
    body += r.markup
    const resolvedShadePipeline = resolveDrawableShadePassPipelineV0(
      layer.inner,
      layer.passes,
      layer.inner ? FieldEngine.resolveAutoBalancedShades(layer.inner) : undefined,
    )
    for (const pass of resolvedShadePipeline) {
      if (!pass.fieldInputs?.sourceLayerOffset || pass.markBudget <= 0) continue
      const inter = renderInterLayerShadePass(scene, layer, idx, pass, options)
      defs += inter.defs
      body += inter.markup
    }
  })
  return (defs ? `<defs>${defs}</defs>` : '') + body
}

export function renderMorphRuntimeDocumentV0(document: MorphRuntimeDocumentV0, options?: DrawableRenderOptions): string {
  const boil = document.settings?.boil
  const boilIsActive = boil !== 'off' && (boil !== 'active-only' || (options?.progress ?? 0) > 0)
  return renderDrawableScene(document.scene, {
    ...options,
    frame: boilIsActive ? options?.frame ?? 0 : 0,
    timeMs: boilIsActive ? options?.timeMs : 0,
    fieldCache: options?.fieldCache ?? document.cache?.fields,
  })
}
