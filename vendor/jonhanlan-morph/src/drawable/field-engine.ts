import type { MorphPoint } from '../geometry/morph-core'
import type { DrawableLayer, InnerShaderPassConfig } from './types'

export type FieldBounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
  cx: number
  cy: number
  w: number
  h: number
}

export type ShadePassConfig = InnerShaderPassConfig
export type InnerShadeConfig = NonNullable<DrawableLayer['inner']>
export type ShadeFieldSide = NonNullable<ShadePassConfig['fieldSide']>

export type ContourFrame = {
  d2: number
  distance: number
  inside: boolean
  tx: number
  ty: number
  nx: number
  ny: number
  pathT: number
  corner: number
}

export type ContourSegment = {
  a: MorphPoint
  b: MorphPoint
  len: number
  len2: number
  tx: number
  ty: number
  nx: number
  ny: number
  start: number
  turnA: number
  turnB: number
}

export type ContourField = {
  segments: ContourSegment[]
  length: number
}

export type SerializedContourSegment = {
  ax: number
  ay: number
  bx: number
  by: number
  len: number
  len2: number
  tx: number
  ty: number
  nx: number
  ny: number
  start: number
  turnA: number
  turnB: number
}

export type SerializedContourField = {
  length?: number
  segments?: SerializedContourSegment[]
  points?: Array<[number, number]>
}

export type FieldSample = {
  inside: boolean
  signedDistance: number
  pathT: number
  direction01: number
  corner01: number
  noise01: number
  shadow01: number
  highlight01: number
  distanceFalloff01: number
  directionFalloff01: number
  cornerFalloff01: number
  fieldStrength: number
  tone01: number
  markDensity01: number
  markSize01: number
  markOpacity01: number
}

export type FormShadeSample = {
  amount: number
  fieldStrength: number
}

export function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function smoothstep(value: number) {
  return value * value * (3 - 2 * value)
}

function smoothBand(edge0: number, edge1: number, value: number) {
  if (Math.abs(edge1 - edge0) < 0.0001) return value >= edge1 ? 1 : 0
  return smoothstep(clamp01((value - edge0) / (edge1 - edge0)))
}

function polygonCentroid(points: MorphPoint[]) {
  let x = 0
  let y = 0
  for (const p of points) {
    x += p.x
    y += p.y
  }
  return { x: x / Math.max(1, points.length), y: y / Math.max(1, points.length) }
}

function pointInPolygon(x: number, y: number, points: MorphPoint[]) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]
    const b = points[j]
    if (((a.y > y) !== (b.y > y)) && x < ((b.x - a.x) * (y - a.y)) / ((b.y - a.y) || 0.0001) + a.x) inside = !inside
  }
  return inside
}

function pointTurn(points: MorphPoint[], index: number) {
  const n = points.length
  const prev = points[(index - 1 + n) % n]
  const p = points[index]
  const next = points[(index + 1) % n]
  const ax = p.x - prev.x
  const ay = p.y - prev.y
  const bx = next.x - p.x
  const by = next.y - p.y
  const al = Math.sqrt(ax * ax + ay * ay) || 1
  const bl = Math.sqrt(bx * bx + by * by) || 1
  const dot = Math.max(-1, Math.min(1, (ax / al) * (bx / bl) + (ay / al) * (by / bl)))
  return clamp01((1 - dot) * 0.5)
}

export function createContourField(core: MorphPoint[]): ContourField {
  const c = polygonCentroid(core)
  const lengths = core.map((a, index) => {
    const b = core[(index + 1) % core.length]
    const vx = b.x - a.x
    const vy = b.y - a.y
    return Math.sqrt(vx * vx + vy * vy) || 1
  })
  const total = lengths.reduce((sum, len) => sum + len, 0) || 1
  let start = 0
  const segments = core.map((a, index) => {
    const b = core[(index + 1) % core.length]
    const vx = b.x - a.x
    const vy = b.y - a.y
    const len = lengths[index]
    const len2 = len * len || 1
    const tx = vx / len
    const ty = vy / len
    let nx = -ty
    let ny = tx
    const mx = (a.x + b.x) * 0.5
    const my = (a.y + b.y) * 0.5
    if ((mx + nx - c.x) * (mx - c.x) + (my + ny - c.y) * (my - c.y) < 0) {
      nx = -nx
      ny = -ny
    }
    const segment = { a, b, len, len2, tx, ty, nx, ny, start, turnA: pointTurn(core, index), turnB: pointTurn(core, (index + 1) % core.length) }
    start += len
    return segment
  })
  return { segments, length: total }
}

export function serializeContourField(field: ContourField, precision = 3): SerializedContourField {
  return {
    points: field.segments.map((segment) => [
      cacheNumber(segment.a.x, precision),
      cacheNumber(segment.a.y, precision),
    ]),
  }
}

export function hydrateContourField(serialized: SerializedContourField): ContourField {
  if (serialized.points?.length) {
    return createContourField(serialized.points.map(([x, y]) => ({ x, y })))
  }
  return {
    length: serialized.length ?? 0,
    segments: (serialized.segments ?? []).map((segment) => ({
      a: { x: segment.ax, y: segment.ay },
      b: { x: segment.bx, y: segment.by },
      len: segment.len,
      len2: segment.len2,
      tx: segment.tx,
      ty: segment.ty,
      nx: segment.nx,
      ny: segment.ny,
      start: segment.start,
      turnA: segment.turnA,
      turnB: segment.turnB,
    })),
  }
}

function cacheNumber(value: number, precision: number) {
  return Number(value.toFixed(precision))
}

function nearestContourFrame(x: number, y: number, field: ContourField): ContourFrame {
  let best = { d2: Infinity, distance: Infinity, inside: false, tx: 1, ty: 0, nx: 0, ny: -1, pathT: 0, corner: 0 }
  for (const segment of field.segments) {
    const vx = segment.b.x - segment.a.x
    const vy = segment.b.y - segment.a.y
    const t = Math.max(0, Math.min(1, ((x - segment.a.x) * vx + (y - segment.a.y) * vy) / segment.len2))
    const px = segment.a.x + vx * t
    const py = segment.a.y + vy * t
    const dx = x - px
    const dy = y - py
    const d2 = dx * dx + dy * dy
    if (d2 < best.d2) {
      best = {
        d2,
        distance: Math.sqrt(d2),
        inside: false,
        tx: segment.tx,
        ty: segment.ty,
        nx: segment.nx,
        ny: segment.ny,
        pathT: ((segment.start + segment.len * t) / field.length) % 1,
        corner: (segment.turnA * (1 - t) + segment.turnB * t) * Math.abs(t - 0.5) * 2,
      }
    }
  }
  return best
}

export function contourFrameAt(x: number, y: number, core: MorphPoint[], field: ContourField): ContourFrame {
  const frame = nearestContourFrame(x, y, field)
  return { ...frame, inside: pointInPolygon(x, y, core) }
}

export function shadeFieldSide(pass: ShadePassConfig): ShadeFieldSide {
  return pass.fieldSide ?? 'inside'
}

export function fieldSideAllows(inside: boolean, side: ShadeFieldSide) {
  return side === 'both' || (side === 'inside' ? inside : !inside)
}

export function shadeBandCenter(pass: ShadePassConfig, maxDist: number) {
  const offset = Math.max(0, Math.min(0.95, pass.offset ?? 0.4))
  const fieldOffset = Math.max(-1, Math.min(1, pass.fieldOffset ?? 0))
  const offsetDistance = offset * maxDist * 0.48
  const fieldShift = fieldOffset * maxDist * 0.3
  const side = shadeFieldSide(pass)
  if (side === 'outside') return Math.min(0, -offsetDistance + fieldShift)
  if (side === 'both') return fieldShift
  return Math.max(0, offsetDistance + fieldShift)
}

export function shadeMaxDist(b: FieldBounds, pass: ShadePassConfig) {
  const spread = Math.max(0.08, Math.min(1.4, pass.spread ?? 0.6))
  const fieldDepth = Math.max(0.35, Math.min(2.2, pass.fieldDepth ?? 1))
  return Math.max(6, Math.min(b.w, b.h) * (0.08 + spread * 0.42) * fieldDepth)
}

function directionAmount(side: number, pass: ShadePassConfig) {
  if (pass.hardStop) return Math.max(0, side)
  const lengthFalloff = Math.max(0, Math.min(1, pass.lengthFalloff ?? pass.fieldSoftness ?? 0.42))
  if (lengthFalloff <= 0.01) return Math.max(0, side)
  const softness = 0.04 + lengthFalloff * 0.34
  const softenedSide = clamp01((side + softness * 0.42) / (1 + softness * 0.42))
  return Math.pow(softenedSide, 0.82)
}

export function cornerAmount(frame: ContourFrame, pass: ShadePassConfig) {
  if (pass.hardStop) return 0
  const cornerSmoothing = Math.max(0, Math.min(1, pass.cornerSmoothing ?? 0))
  return smoothBand(0.08, 0.72, frame.corner) * cornerSmoothing
}

export function fieldSampleAt(frame: ContourFrame, b: FieldBounds, pass: ShadePassConfig, fieldNoise = 0, lit = false): FieldSample {
  const rad = (pass.angle || 0) * Math.PI / 180
  const lx = Math.cos(rad)
  const ly = Math.sin(rad)
  const spread = Math.max(0.08, Math.min(1.4, pass.spread ?? 0.6))
  const coverage = Math.max(0.05, Math.min(1, pass.coverage ?? 0.9))
  const banding = Math.max(0, Math.min(1, pass.banding ?? 0))
  const fieldSoftness = Math.max(0, Math.min(1, pass.fieldSoftness ?? 0.42))
  const fieldContrast = Math.max(0, Math.min(1, pass.fieldContrast ?? 0.5))
  const densityEdge = Math.max(0, Math.min(1.4, pass.densityEdge ?? 0.4))
  const densityFalloff = Math.max(0, Math.min(1, pass.densityFalloff ?? 0))
  const sizeFalloff = Math.max(0, Math.min(1, pass.sizeFalloff ?? 0))
  const maxDist = shadeMaxDist(b, pass)
  const signedDistance = frame.inside ? frame.distance : -frame.distance
  const offsetCenter = shadeBandCenter(pass, maxDist)
  const corner = cornerAmount(frame, pass)
  const inwardDepth = Math.max(0, signedDistance - offsetCenter)
  const outwardDepth = Math.max(0, offsetCenter - signedDistance)
  const inwardReach = maxDist * (0.36 + spread * 0.55 + fieldSoftness * 0.85) * (1 + corner * 0.7)
  const outwardReach = maxDist * (0.08 + fieldSoftness * 0.22)
  const inwardT = inwardDepth / Math.max(1, inwardReach)
  const outwardT = outwardDepth / Math.max(1, outwardReach)
  const inwardGradient = pass.hardStop ? (inwardDepth <= inwardReach ? 1 : 0) : Math.exp(-Math.pow(inwardT, 1.18) * (1.55 - fieldSoftness * 0.38))
  const outwardGradient = pass.hardStop ? 1 : Math.exp(-Math.pow(outwardT, 1.35) * 2.4)
  const distanceFalloff01 = clamp01(inwardGradient * outwardGradient)
  const cornerFalloff01 = 1 - corner * (0.42 + densityFalloff * 0.42 + sizeFalloff * 0.12)
  const side = frame.nx * lx + frame.ny * ly
  const shadow01 = directionAmount(-side - fieldNoise * 0.05, pass)
  const highlight01 = directionAmount(side + fieldNoise * 0.05, pass)
  const directionFalloff01 = lit ? highlight01 : shadow01
  const fieldStrength = clamp01(distanceFalloff01 * Math.pow(directionFalloff01, 0.72) * cornerFalloff01)
  let tone01 = fieldStrength * (0.78 + spread * 0.34)
  tone01 = clamp01((tone01 - (1 - coverage) * 0.42) / coverage)
  if (fieldContrast > 0) {
    const pivot = 0.48
    const contrast = 1 + fieldContrast * 2.2
    tone01 = clamp01((tone01 - pivot) * contrast + pivot)
  }
  if (banding > 0) {
    const bands = 2 + Math.round(banding * 6)
    const stepped = Math.floor(tone01 * bands) / bands
    tone01 = tone01 * (1 - banding * 0.72) + stepped * banding * 0.72
  }
  const markDensity01 = clamp01((fieldStrength * (0.64 + densityEdge * 0.16) + tone01 * 0.24) * (0.72 + cornerFalloff01 * 0.28))
  const markSize01 = sizeFalloffScale(fieldStrength, sizeFalloff) * (0.74 + cornerFalloff01 * 0.26)
  const markOpacity01 = markOpacity(fieldStrength, markDensity01, markSize01, densityFalloff, sizeFalloff) * (0.68 + cornerFalloff01 * 0.32)
  return {
    inside: frame.inside,
    signedDistance,
    pathT: frame.pathT,
    direction01: clamp01((side + 1) * 0.5),
    corner01: clamp01(frame.corner),
    noise01: clamp01((fieldNoise + 1) * 0.5),
    shadow01,
    highlight01,
    distanceFalloff01,
    directionFalloff01,
    cornerFalloff01,
    fieldStrength,
    tone01,
    markDensity01,
    markSize01,
    markOpacity01,
  }
}

export function formShadeSample(frame: ContourFrame, b: FieldBounds, pass: ShadePassConfig, lit: boolean, fieldNoise = 0): FormShadeSample {
  const sample = fieldSampleAt(frame, b, pass, fieldNoise, lit)
  return { amount: sample.tone01, fieldStrength: sample.fieldStrength }
}

export function densityKeepAmount(densityAmt: number, fieldStrength: number, densityFalloff: number) {
  if (densityFalloff <= 0.01) return 1
  const fieldTail = Math.pow(clamp01(fieldStrength), 0.58 + densityFalloff * 0.62)
  const densityTail = Math.pow(clamp01(densityAmt), 0.62 + densityFalloff * 0.78)
  return clamp01(0.018 + fieldTail * 0.28 + densityTail * 0.7)
}

export function sizeFalloffScale(fieldStrength: number, sizeFalloff: number) {
  if (sizeFalloff <= 0.01) return 1
  const scale = 0.06 + Math.pow(clamp01(fieldStrength), 0.58) * 0.94
  return 1 - sizeFalloff + sizeFalloff * scale
}

export function markOpacity(fieldStrength: number, densityAmt: number, sizeScale: number, densityFalloff: number, sizeFalloff: number) {
  const falloff = Math.max(densityFalloff, sizeFalloff)
  if (falloff <= 0.01) return 1
  const fieldOpacity = 0.06 + Math.pow(clamp01(fieldStrength), 0.72) * 0.94
  const densityOpacity = 0.18 + Math.pow(clamp01(densityAmt), 0.78) * 0.82
  return Math.max(0.055, Math.min(1, fieldOpacity * 0.58 + densityOpacity * 0.28 + sizeScale * 0.14))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function resolvedAutoShadePass(pass: ShadePassConfig, coverage: number, curvedFormBias: number): ShadePassConfig {
  const curve = clamp01(curvedFormBias)
  const share = clamp01(coverage)
  const rendererCoverage = 0.18 + share * 0.82
  const strengthScale = 0.48 + share * 0.52
  return {
    ...pass,
    coverage: rendererCoverage,
    intensity: pass.intensity * strengthScale,
    densityEdge: (pass.densityEdge ?? 0.4) * strengthScale,
    contourAlign: lerp(pass.contourAlign ?? 0.72, 0.96, curve * 0.68),
    cornerSmoothing: Math.max(pass.cornerSmoothing ?? 0, 0.36 + curve * 0.54),
    fieldSoftness: Math.max(pass.fieldSoftness ?? 0.42, 0.42 + curve * 0.34),
    lengthFalloff: Math.max(pass.lengthFalloff ?? 0.42, 0.4 + curve * 0.48),
  }
}

export function resolveAutoBalancedShades(inner: InnerShadeConfig) {
  const shadow = inner.innerShadow
  const highlight = inner.highlight
  const balance = inner.autoBalance
  if (!balance?.enabled || !shadow || !highlight) return { innerShadow: shadow, highlight }

  const separation = clamp01(balance.separation ?? 0)
  const overlap = clamp01(balance.overlap ?? 0)
  const shadowIntent = clamp01(balance.shadowCoverage ?? shadow.coverage ?? 0.68)
  const highlightIntent = clamp01(balance.highlightCoverage ?? (1 - shadowIntent))
  const highlightMax = clamp01(1 - shadowIntent - separation + overlap * shadowIntent * 0.55)
  const shadowMax = clamp01(1 - highlightIntent - separation + overlap * highlightIntent * 0.55)
  const shadowCoverage = Math.max(0.04, Math.min(shadowIntent, Math.max(shadowMax, shadowIntent * (1 - separation * 0.32))))
  const highlightCoverage = Math.max(0.04, Math.min(highlightIntent, highlightMax))
  const curvedFormBias = clamp01(balance.curvedFormBias ?? 0)

  return {
    innerShadow: resolvedAutoShadePass(shadow, shadowCoverage, curvedFormBias),
    highlight: resolvedAutoShadePass(highlight, highlightCoverage, curvedFormBias),
  }
}
