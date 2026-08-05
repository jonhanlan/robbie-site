import { parsePathToPoints } from './geometry/shape-morph'
import {
  alignClosedPathToReference,
  formatMorphNumber,
  linearClosedPathD,
  morphPointSets,
  normalizePointArray,
  resampleClosedPath,
  smoothstep,
  steppedProgress,
  type MorphPoint,
  type MorphPointTuple,
} from './geometry/morph-core'

export type HandDrawnMorphPoint = MorphPoint
export type HandDrawnMorphPathInput = MorphPoint[] | MorphPointTuple[] | string

export interface HandDrawnMorphPathSet {
  pathA: HandDrawnMorphPathInput
  pathB: HandDrawnMorphPathInput
}

export interface ResolvedHandDrawnMorphPathSet {
  a: MorphPoint[]
  b: MorphPoint[]
}

export interface StoredHandDrawnMorphPathSet {
  version: 1
  pathA: MorphPoint[]
  pathB: MorphPoint[]
  updatedAt: string
}

export interface HandDrawnMorphEdgeStyle {
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
  outerEdge: number
  innerEdge: number
  cornerBite: number
  inkBleed: number
  edgeWeight: number
  dryBrush: number
  fiberAngle: number
  fiberFlow: number
  clusterScale: number
  boilAmount: number
}

export const HAND_DRAWN_MORPH_VIEWBOX_WIDTH = 720
export const HAND_DRAWN_MORPH_VIEWBOX_HEIGHT = 960
export const HAND_DRAWN_MORPH_INPUT_POINTS = 180
export const HAND_DRAWN_MORPH_OUTPUT_POINTS = 320
export const HAND_DRAWN_MORPH_FRAME_RATE = 12
export const HAND_DRAWN_MORPH_MORPH_FRAME_RATE = 6
export const HAND_DRAWN_MORPH_EDGE_SEED_HOLD_FRAMES = 3
export const HAND_DRAWN_MORPH_BASE_SEED = 29
// Texture is calibrated for a full-frame outline (the profile's shorter span is
// ~460u). Smaller poses scale their edge texture down proportionally so a tiny
// pose doesn't read as a noisy blob; full-frame poses clamp to 1 (no change).
export const HAND_DRAWN_MORPH_TEXTURE_REFERENCE = 460

export const DEFAULT_HAND_DRAWN_MORPH_EDGE_STYLE: HandDrawnMorphEdgeStyle = {
  intensity: 13,
  wobble: 0.16,
  tooth: 0.78,
  breakup: 0.62,
  shortMarks: 0.02,
  rake: 0.06,
  flecks: 0.72,
  speckles: 1.1,
  grain: 0.86,
  fineFibers: 0,
  erosion: 0.32,
  clustering: 0.88,
  detailScale: 0.56,
  outerEdge: 1,
  innerEdge: 0.55,
  cornerBite: 0.38,
  inkBleed: 0.22,
  edgeWeight: 0.42,
  dryBrush: 0.16,
  fiberAngle: 0,
  fiberFlow: 0.28,
  clusterScale: 1,
  boilAmount: 1,
} as const

export function resolveHandDrawnMorphEdgeStyle(style?: Partial<HandDrawnMorphEdgeStyle>): HandDrawnMorphEdgeStyle {
  return {
    ...DEFAULT_HAND_DRAWN_MORPH_EDGE_STYLE,
    ...style,
  }
}

function seededUnit(i: number, seedShift = 0) {
  const noise = Math.sin(i * 12.9898 + seedShift) * 43758.5453
  return noise - Math.floor(noise)
}

function signedRandom(seed: number, index: number) {
  return seededUnit(index * 97.731, seed * 44.91) * 2 - 1
}

function profileCropAnchors(phase = 0): MorphPoint[] {
  const breathe = Math.sin(phase * Math.PI * 2)
  const scallop = Math.max(0, breathe)
  const lift = Math.cos(phase * Math.PI * 2) * 5
  return [
    { x: 253 - scallop * 10, y: 221 + lift - scallop * 4 },
    { x: 303 - scallop * 6, y: 192 + lift - 4 - scallop * 10 },
    { x: 358 + scallop * 3, y: 179 + lift - scallop * 14 },
    { x: 416 + scallop * 9, y: 188 + lift - 2 - scallop * 8 },
    { x: 469 + scallop * 16, y: 214 + lift + scallop * 2 },
    { x: 508 + scallop * 12, y: 260 + lift + 2 + scallop * 8 },
    { x: 534 + scallop * 9, y: 333 + lift - scallop * 5 },
    { x: 546 + scallop * 14, y: 428 + lift + 3 + scallop * 7 },
    { x: 563 + breathe * 14, y: 525 - scallop * 8 },
    { x: 585 + breathe * 19, y: 625 + scallop * 10 },
    { x: 607 + breathe * 14, y: 730 - scallop * 4 },
    { x: 571 + scallop * 4, y: 824 + scallop * 15 },
    { x: 502 - scallop * 8, y: 888 + scallop * 7 },
    { x: 409 + scallop * 5, y: 916 + scallop * 14 },
    { x: 306 - scallop * 10, y: 906 + scallop * 4 },
    { x: 214 - scallop * 17, y: 849 + scallop * 9 },
    { x: 158 - scallop * 20, y: 747 - scallop * 4 },
    { x: 138 - breathe * 18, y: 626 + scallop * 12 },
    { x: 145 - breathe * 17, y: 500 - scallop * 7 },
    { x: 170 - scallop * 12, y: 388 + lift + scallop * 8 },
    { x: 207 - scallop * 10, y: 294 + lift - scallop * 7 },
  ]
}

function contourNoise(t: number, seed = 0) {
  return (
    Math.sin(t * Math.PI * 2 * 1.1 + seed * 0.37) * 0.52 +
    Math.sin(t * Math.PI * 2 * 2.4 + seed * 0.61) * 0.32 +
    Math.sin(t * Math.PI * 2 * 5.8 + seed * 0.83) * 0.14
  )
}

function signedKnot(seed: number, index: number) {
  return seededUnit(index * 17.13, seed * 31.7) * 2 - 1
}

function knotNoise(t: number, count: number, seed: number) {
  const scaled = t * count
  const index = Math.floor(scaled)
  const local = smoothstep(scaled - index)
  const a = signedKnot(seed, index)
  const b = signedKnot(seed, index + 1)
  return a + (b - a) * local
}

function charcoalFiber(t: number, seed: number) {
  const fiberA = Math.sin(t * Math.PI * 2 * 97 + seed * 0.91)
  const fiberB = Math.sin(t * Math.PI * 2 * 173 + seed * 1.21)
  const brokenPressure = Math.max(0, knotNoise(t, 38, seed + 31))
  return (fiberA * 0.06 + fiberB * 0.042) * (0.4 + brokenPressure * 0.8)
}

export function handDrawnContour(
  points: MorphPoint[],
  amount: number,
  seed = 0,
  edge = DEFAULT_HAND_DRAWN_MORPH_EDGE_STYLE,
) {
  if (amount <= 0 || points.length < 3) return points.slice()
  const n = points.length
  const outerEdge = edge.outerEdge ?? 1
  const innerEdge = edge.innerEdge ?? 0.55
  const cornerBite = edge.cornerBite ?? 0
  return points.map((point, i) => {
    const prev = points[(i - 3 + n) % n]
    const next = points[(i + 3) % n]
    const farPrev = points[(i - 7 + n) % n]
    const farNext = points[(i + 7) % n]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    const nx = -ty / len
    const ny = tx / len
    const t = i / n
    const ax = point.x - farPrev.x
    const ay = point.y - farPrev.y
    const bx = farNext.x - point.x
    const by = farNext.y - point.y
    const al = Math.hypot(ax, ay) || 1
    const bl = Math.hypot(bx, by) || 1
    const turn = Math.max(0, Math.min(1, 1 - ((ax / al) * (bx / bl) + (ay / al) * (by / bl))))
    const wobble = contourNoise(t, seed) * 0.38 * edge.wobble
    const pressure = knotNoise(t, 11, seed + 47) * 0.17 * edge.breakup
    const handmade = knotNoise(t, 24, seed + 2) * 0.14 * edge.breakup
    const tooth = knotNoise(t, 150, seed + 9) * 0.11 * edge.tooth
    const tooth2 = knotNoise(t, 260, seed + 27) * 0.07 * edge.tooth
    const scratch = knotNoise(t, 430, seed + 53) * 0.025 * edge.tooth
    const fiber = charcoalFiber(t, seed) * (0.35 + edge.tooth * 0.65)
    const biteGate = Math.max(0, knotNoise(t, 52, seed + 73) - 0.66)
    const bite = biteGate * signedRandom(seed, i) * 0.9 * edge.breakup
    const localAmount = amount * (0.84 + Math.abs(knotNoise(t, 7, seed + 15)) * 0.24)
    const driftRaw = wobble + pressure + handmade + tooth + tooth2 + scratch + fiber + bite
    const sideScale = driftRaw >= 0 ? outerEdge : innerEdge
    const cornerDig = -Math.abs(knotNoise(t, 38, seed + 119)) * cornerBite * turn * 0.38
    const drift = (driftRaw * sideScale + cornerDig) * localAmount
    const tangentDrift = (contourNoise(t + 0.37, seed + 23) * 0.4 + tooth) * amount * 0.08

    return {
      x: point.x + nx * drift + (tx / len) * tangentDrift,
      y: point.y + ny * drift + (ty / len) * tangentDrift,
    }
  })
}

function portraitPath(phase = 0) {
  const anchors = profileCropAnchors(phase)
  const sampled = resampleClosedPath(anchors, HAND_DRAWN_MORPH_INPUT_POINTS)
  return handDrawnContour(sampled, 12, Math.round(phase * 100) + 3)
}

const PATH_A = portraitPath(0)
const PATH_B = portraitPath(0.25)

export const DEFAULT_HAND_DRAWN_MORPH_PATH_SET: ResolvedHandDrawnMorphPathSet = {
  a: PATH_A,
  b: PATH_B,
}

export function pointsFromHandDrawnPathInput(input: HandDrawnMorphPathInput | undefined, fallback: MorphPoint[]) {
  if (!input) return fallback

  if (typeof input === 'string') {
    const parsed = parsePathToPoints(input, 8).map(([x, y]) => ({ x, y }))
    return parsed.length >= 3 ? parsed : fallback
  }

  return normalizePointArray(input) ?? fallback
}

export function resolveHandDrawnMorphPathSet(
  pathA?: HandDrawnMorphPathInput,
  pathB?: HandDrawnMorphPathInput,
  fallback = DEFAULT_HAND_DRAWN_MORPH_PATH_SET,
): ResolvedHandDrawnMorphPathSet {
  const a = resampleClosedPath(
    pointsFromHandDrawnPathInput(pathA, fallback.a),
    HAND_DRAWN_MORPH_INPUT_POINTS,
  )
  const b = resampleClosedPath(
    pointsFromHandDrawnPathInput(pathB, fallback.b),
    HAND_DRAWN_MORPH_INPUT_POINTS,
  )
  const resolvedA = a.length ? a : fallback.a
  const resolvedB = b.length ? b : fallback.b

  return {
    a: resolvedA,
    b: alignClosedPathToReference(resolvedB, resolvedA),
  }
}

export function readStoredHandDrawnMorphPathSet(
  storageKey: string,
  fallback: ResolvedHandDrawnMorphPathSet,
): ResolvedHandDrawnMorphPathSet | null {
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredHandDrawnMorphPathSet> & {
      svgPathA?: string
      svgPathB?: string
    }

    return resolveHandDrawnMorphPathSet(parsed.pathA ?? parsed.svgPathA, parsed.pathB ?? parsed.svgPathB, fallback)
  } catch {
    return null
  }
}

export function makeStoredHandDrawnMorphPathSet(paths: ResolvedHandDrawnMorphPathSet): StoredHandDrawnMorphPathSet {
  return {
    version: 1,
    pathA: paths.a,
    pathB: paths.b,
    updatedAt: new Date().toISOString(),
  }
}

export function steppedHandDrawnMorphProgress(progress: number, durationMs: number) {
  return steppedProgress(progress, durationMs, HAND_DRAWN_MORPH_MORPH_FRAME_RATE)
}

export function morphedHandDrawnPath(paths: ResolvedHandDrawnMorphPathSet, progress: number) {
  return morphPointSets(paths.a, paths.b, progress)
}

function markSub(
  cx: number,
  cy: number,
  tx: number,
  ty: number,
  nx: number,
  ny: number,
  length: number,
  width: number,
  bow = 0,
) {
  const hx = (tx * length) / 2
  const hy = (ty * length) / 2
  const bx = nx * bow
  const by = ny * bow
  const wx = (nx * width) / 2
  const wy = (ny * width) / 2
  const tipA = `${formatMorphNumber(cx - hx)} ${formatMorphNumber(cy - hy)}`
  const tipB = `${formatMorphNumber(cx + hx)} ${formatMorphNumber(cy + hy)}`
  const bellyTop = `${formatMorphNumber(cx + bx + wx)} ${formatMorphNumber(cy + by + wy)}`
  const bellyBot = `${formatMorphNumber(cx + bx - wx)} ${formatMorphNumber(cy + by - wy)}`
  return `M ${tipA} Q ${bellyTop} ${tipB} Q ${bellyBot} ${tipA} Z`
}

function speckSub(cx: number, cy: number, rx: number, ry: number, angle: number, seed: number) {
  const count = 6
  const ca = Math.cos(angle)
  const sa = Math.sin(angle)
  const points: MorphPoint[] = []

  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count
    const rough = 0.72 + seededUnit(i * 11.7, seed + 503) * 0.5
    const x = Math.cos(a) * rx * rough
    const y = Math.sin(a) * ry * rough
    points.push({
      x: cx + x * ca - y * sa,
      y: cy + x * sa + y * ca,
    })
  }

  return linearClosedPathD(points, true)
}

export function edgeDecorations(core: MorphPoint[], seed: number, edge = DEFAULT_HAND_DRAWN_MORPH_EDGE_STYLE) {
  const n = core.length
  let cxSum = 0
  let cySum = 0

  for (const point of core) {
    cxSum += point.x
    cySum += point.y
  }

  const centroid = { x: cxSum / n, y: cySum / n }
  const subs: string[] = []

  // Proportional texture scale from the outline's bounding box: neutral (1) for a
  // full-frame pose, shrinking mark size + count for smaller poses so the grain
  // density tracks the shape instead of swamping it.
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const point of core) {
    if (point.x < minX) minX = point.x
    if (point.x > maxX) maxX = point.x
    if (point.y < minY) minY = point.y
    if (point.y > maxY) maxY = point.y
  }
  const spanMin = Math.min(maxX - minX, maxY - minY)
  const texScale = Math.max(0.25, Math.min(1, spanMin / HAND_DRAWN_MORPH_TEXTURE_REFERENCE))
  const ds = edge.detailScale * texScale
  const bleed = Math.max(0, edge.inkBleed ?? 0)
  const outer = Math.max(0.1, edge.outerEdge ?? 1)
  const inner = Math.max(0.1, edge.innerEdge ?? 0.55)
  const dry = Math.max(0, Math.min(1, edge.dryBrush ?? 0))
  const fiberFlow = Math.max(0, Math.min(1, edge.fiberFlow ?? 0))
  const fiberAngle = ((edge.fiberAngle ?? 0) * Math.PI) / 180
  const clusterScale = Math.max(0.35, Math.min(2.5, edge.clusterScale ?? 1))

  const frame = (i: number) => {
    const point = core[i]
    const prev = core[(i - 3 + n) % n]
    const next = core[(i + 3) % n]
    let tx = next.x - prev.x
    let ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    tx /= len
    ty /= len

    let nx = -ty
    let ny = tx
    if (nx * (point.x - centroid.x) + ny * (point.y - centroid.y) < 0) {
      nx = -nx
      ny = -ny
    }

    return { point, tx, ty, nx, ny }
  }

  const pickSpot = (k: number, salt: number) => {
    for (let c = 0; c < 4; c++) {
      const u = seededUnit(k * 3.7 + c * 57.3, seed * 1.9 + salt)
      const gate = (knotNoise(u, Math.max(3, 13 / clusterScale), seed + 101 + salt) + 1) / 2
      const accept = 1 - edge.clustering + edge.clustering * gate
      if (seededUnit(k * 19.3 + c * 71.9, seed + 7 + salt) <= accept) return u
    }
    return seededUnit(k * 3.7, seed * 1.9 + salt)
  }

  const rotateFrame = (tx: number, ty: number, nx: number, ny: number, angle: number) => {
    const c = Math.cos(angle)
    const s = Math.sin(angle)
    const rtx = tx * c + nx * s
    const rty = ty * c + ny * s
    let rnx = -rty
    let rny = rtx
    if (rnx * nx + rny * ny < 0) {
      rnx = -rnx
      rny = -rny
    }
    return { tx: rtx, ty: rty, nx: rnx, ny: rny }
  }

  const place = (
    k: number,
    salt: number,
    offset: number,
    length: number,
    width: number,
    slide: number,
    bow = 0,
    rakeScale = 1,
  ) => {
    if (dry && seededUnit(k * 41.7 + salt * 3.1, seed + 977) < dry * 0.34) return
    const i = Math.floor(pickSpot(k, salt) * n)
    const { point, tx, ty, nx, ny } = frame(i)
    const tangentAngle = Math.atan2(ty, tx)
    let delta = fiberAngle - tangentAngle
    delta = Math.atan2(Math.sin(delta), Math.cos(delta))
    const rakeAngle = (seededUnit(k * 31.1 + salt * 7.3, seed + 409) - 0.5) * edge.rake * rakeScale * 0.72 + delta * fiberFlow
    const markFrame = rotateFrame(tx, ty, nx, ny, rakeAngle)

    subs.push(
      markSub(
        point.x + nx * offset * ds + tx * slide * ds,
        point.y + ny * offset * ds + ty * slide * ds,
        markFrame.tx,
        markFrame.ty,
        markFrame.nx,
        markFrame.ny,
        length * ds,
        width * ds,
        bow * ds,
      ),
    )
  }

  const placeSpeck = (
    k: number,
    salt: number,
    offset: number,
    rx: number,
    ry: number,
    slide: number,
    angle = 0,
  ) => {
    if (dry && seededUnit(k * 37.7 + salt * 5.1, seed + 991) < dry * 0.24) return
    const i = Math.floor(pickSpot(k, salt) * n)
    const { point, tx, ty, nx, ny } = frame(i)

    subs.push(
      speckSub(
        point.x + nx * offset * ds + tx * slide * ds,
        point.y + ny * offset * ds + ty * slide * ds,
        rx * ds,
        ry * ds,
        angle + Math.atan2(ty, tx),
        seed + salt + k * 19.1,
      ),
    )
  }

  const streakCount = Math.round(edge.shortMarks * (8 + bleed * 5) * texScale)
  for (let k = 0; k < streakCount; k++) {
    const inward = seededUnit(k * 7.1, seed + 4) < 0.42
    const bristles = 1 + Math.floor(seededUnit(k * 13.9, seed + 21) * 2)
    for (let b = 0; b < bristles; b++) {
      place(
        k,
        0,
        (0.9 + seededUnit(k * 5.3 + b * 41.7, seed + 8) * (3.2 + bleed * 2.8) + b * 0.8) * (inward ? -inner : outer),
        1.8 + seededUnit(k * 9.7 + b * 23.3, seed + 12) * (3.6 + bleed * 4.2),
        0.62 + seededUnit(k * 11.3 + b * 17.9, seed + 16) * (0.82 + bleed * 0.42),
        (seededUnit(k * 15.1 + b * 29.5, seed + 33) - 0.5) * 4,
        (seededUnit(k * 21.7 + b * 31.1, seed + 41) - 0.5) * 0.5,
        0.45,
      )
    }
  }

  const fleckCount = Math.round(edge.flecks * (52 + bleed * 36) * texScale)
  for (let k = 0; k < fleckCount; k++) {
    placeSpeck(
      k,
      50,
      (seededUnit(k * 8.9, seed + 61) - 0.18) * (4.2 + bleed * 3.6),
      1.2 + seededUnit(k * 12.7, seed + 67) * (2.5 + bleed * 1.7),
      0.8 + seededUnit(k * 14.3, seed + 71) * (1.8 + bleed * 1.2),
      (seededUnit(k * 16.7, seed + 77) - 0.5) * 4.8,
      seededUnit(k * 4.3, seed + 79) * Math.PI,
    )
  }

  const speckCount = Math.round(edge.speckles * (300 + bleed * 90) * texScale)
  for (let k = 0; k < speckCount; k++) {
    const inward = seededUnit(k * 10.7, seed + 166) < 0.78
    placeSpeck(
      k,
      82,
      (0.2 + seededUnit(k * 8.9, seed + 161) * (5.4 + bleed * 3.4)) * (inward ? -inner : outer * 0.8),
      1.3 + seededUnit(k * 12.7, seed + 167) * (3.5 + bleed * 1.6),
      0.9 + seededUnit(k * 14.3, seed + 171) * (2.6 + bleed * 1.1),
      (seededUnit(k * 16.7, seed + 177) - 0.5) * 4.6,
      seededUnit(k * 4.3, seed + 181) * Math.PI,
    )
  }

  const grainCount = Math.round(edge.grain * 230 * texScale)
  for (let k = 0; k < grainCount; k++) {
    placeSpeck(
      k,
      120,
      (seededUnit(k * 7.7, seed + 83) - 0.44) * 4.2,
      0.32 + seededUnit(k * 9.1, seed + 87) * 0.9,
      0.24 + seededUnit(k * 10.9, seed + 91) * 0.62,
      (seededUnit(k * 12.1, seed + 95) - 0.5) * 5,
      seededUnit(k * 4.3, seed + 99) * Math.PI,
    )
  }

  const hairCount = Math.round(edge.fineFibers * 5 * texScale)
  for (let k = 0; k < hairCount; k++) {
    const inward = seededUnit(k * 6.3, seed + 113) < 0.5
    place(
      k,
      200,
      (0.8 + seededUnit(k * 8.1, seed + 117) * 2.4) * (inward ? -1 : 1),
      7 + seededUnit(k * 9.9, seed + 121) * 13,
      0.22 + seededUnit(k * 11.7, seed + 125) * 0.3,
      (seededUnit(k * 13.3, seed + 129) - 0.5) * 8,
      (seededUnit(k * 17.9, seed + 133) - 0.5) * 2.2,
      0.35,
    )
  }

  const erodeCount = Math.round(edge.erosion * 86 * texScale)
  for (let k = 0; k < erodeCount; k++) {
    placeSpeck(
      k,
      300,
      -(0.35 + seededUnit(k * 7.3, seed + 141) * 4.2),
      0.9 + seededUnit(k * 9.7, seed + 145) * 2.6,
      0.6 + seededUnit(k * 11.1, seed + 149) * 1.8,
      (seededUnit(k * 13.9, seed + 153) - 0.5) * 5.4,
      seededUnit(k * 5.1, seed + 157) * Math.PI,
    )
  }

  return subs.join(' ')
}

export function outputHandDrawnPathAt(
  paths: ResolvedHandDrawnMorphPathSet,
  amount: number,
  seed = HAND_DRAWN_MORPH_BASE_SEED,
  style?: Partial<HandDrawnMorphEdgeStyle>,
) {
  const edge = resolveHandDrawnMorphEdgeStyle(style)
  const lowRes = resampleClosedPath(morphedHandDrawnPath(paths, amount), HAND_DRAWN_MORPH_OUTPUT_POINTS)
  return handDrawnContour(lowRes, edge.intensity, seed, edge)
}

export function outputHandDrawnMaskD(
  paths: ResolvedHandDrawnMorphPathSet,
  amount: number,
  seed = HAND_DRAWN_MORPH_BASE_SEED,
  style?: Partial<HandDrawnMorphEdgeStyle>,
) {
  const edge = resolveHandDrawnMorphEdgeStyle(style)
  const core = outputHandDrawnPathAt(paths, amount, seed, edge)
  return `${linearClosedPathD(core, true)} ${edgeDecorations(core, seed, edge)}`.trim()
}
