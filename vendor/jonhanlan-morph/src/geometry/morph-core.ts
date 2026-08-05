export type MorphPoint = {
  x: number
  y: number
}

export type MorphPointTuple = [number, number]
export type MorphPointInput = MorphPoint[] | MorphPointTuple[]

export function formatMorphNumber(value: number) {
  return Number(value).toFixed(2).replace(/\.?0+$/, '')
}

export function lerpNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress
}

export function distanceBetweenPoints(a: MorphPoint, b: MorphPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

export function squaredDistanceBetweenPoints(a: MorphPoint, b: MorphPoint) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function isTuplePoint(value: unknown): value is MorphPointTuple {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    typeof value[0] === 'number' &&
    typeof value[1] === 'number'
  )
}

export function isObjectPoint(value: unknown): value is MorphPoint {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as MorphPoint).x === 'number' &&
    typeof (value as MorphPoint).y === 'number'
  )
}

export function normalizePointArray(input: unknown): MorphPoint[] | null {
  if (!Array.isArray(input)) return null

  const points = input
    .map((point) => {
      if (isTuplePoint(point)) return { x: point[0], y: point[1] }
      if (isObjectPoint(point)) return { x: point.x, y: point.y }
      return null
    })
    .filter((point): point is MorphPoint => Boolean(point))

  return points.length >= 3 ? points : null
}

export function tuplesToPoints(points: number[][] | MorphPointTuple[] | undefined) {
  if (!points) return []
  return points
    .map((point) => {
      if (Array.isArray(point) && typeof point[0] === 'number' && typeof point[1] === 'number') {
        return { x: point[0], y: point[1] }
      }
      return null
    })
    .filter((point): point is MorphPoint => Boolean(point))
}

export function pointsToTuples(points: MorphPoint[]): MorphPointTuple[] {
  return points.map((point) => [point.x, point.y])
}

export function resampleClosedPath(points: MorphPoint[], count: number) {
  if (points.length < 3 || count < 3) return []
  const closed = [...points, points[0]]
  const lengths: number[] = []
  let total = 0

  for (let i = 1; i < closed.length; i++) {
    const length = distanceBetweenPoints(closed[i - 1], closed[i])
    lengths.push(length)
    total += length
  }

  const out: MorphPoint[] = []
  let segment = 0
  let walked = 0

  for (let i = 0; i < count; i++) {
    const target = (total * i) / count
    while (segment < lengths.length - 1 && walked + lengths[segment] < target) {
      walked += lengths[segment]
      segment++
    }

    const segmentLength = lengths[segment]
    const local = target - walked
    const t = segmentLength ? local / segmentLength : 0
    const a = closed[segment]
    const b = closed[segment + 1]
    out.push({
      x: lerpNumber(a.x, b.x, t),
      y: lerpNumber(a.y, b.y, t),
    })
  }

  return out
}

export function rotateClosedPath(points: MorphPoint[], offset: number) {
  const n = points.length
  if (!n) return []
  return points.map((_, i) => points[(i + offset) % n])
}

export function signedClosedPathArea(points: MorphPoint[]) {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const current = points[i]
    const next = points[(i + 1) % points.length]
    area += current.x * next.y - next.x * current.y
  }
  return area / 2
}

function alignmentScore(reference: MorphPoint[], candidate: MorphPoint[]) {
  let score = 0
  for (let i = 0; i < reference.length; i++) {
    score += squaredDistanceBetweenPoints(reference[i], candidate[i])
  }
  return score / reference.length
}

export function alignClosedPathToReference(candidate: MorphPoint[], reference: MorphPoint[]) {
  if (candidate.length < 3 || reference.length < 3) return candidate.slice()
  const count = reference.length
  const sampled = candidate.length === count ? candidate.slice() : resampleClosedPath(candidate, count)
  const referenceArea = signedClosedPathArea(reference)
  const sampledArea = signedClosedPathArea(sampled)
  const candidates = referenceArea && sampledArea && Math.sign(referenceArea) !== Math.sign(sampledArea)
    ? [sampled.slice().reverse()]
    : [sampled, sampled.slice().reverse()]
  let best = sampled
  let bestScore = Infinity

  for (const variant of candidates) {
    for (let offset = 0; offset < count; offset++) {
      const rotated = rotateClosedPath(variant, offset)
      const score = alignmentScore(reference, rotated)
      if (score < bestScore) {
        best = rotated
        bestScore = score
      }
    }
  }

  return best
}

export function morphPointSets(from: MorphPoint[], to: MorphPoint[], progress: number) {
  return from.map((point, i) => ({
    x: lerpNumber(point.x, to[i].x, progress),
    y: lerpNumber(point.y, to[i].y, progress),
  }))
}

export type SplitMotionPair = {
  from: MorphPoint[]
  to: MorphPoint[]
}

export type SplitMotionPlan = {
  pairs: SplitMotionPair[]
  method: 'partition' | 'duplicate'
  confidence: 'high' | 'medium' | 'low'
}

export function centroidOf(points: MorphPoint[]) {
  if (!points.length) return { x: 0, y: 0 }
  return points.reduce(
    (sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }),
    { x: 0, y: 0 },
  )
}

function angleBetween(center: MorphPoint, point: MorphPoint) {
  return Math.atan2(point.y - center.y, point.x - center.x)
}

function angularDistance(a: number, b: number) {
  const tau = Math.PI * 2
  return Math.abs(((a - b + Math.PI) % tau + tau) % tau - Math.PI)
}

function closestAngleIndex(angle: number, targets: number[]) {
  let best = 0
  let bestDistance = Infinity
  targets.forEach((target, index) => {
    const distance = angularDistance(angle, target)
    if (distance < bestDistance) {
      best = index
      bestDistance = distance
    }
  })
  return best
}

function duplicateSplitPlan(source: MorphPoint[], targetGroups: MorphPoint[][], pointCount: number): SplitMotionPlan {
  return {
    method: 'duplicate',
    confidence: 'medium',
    pairs: targetGroups.map((targetGroup) => {
      const to = resampleClosedPath(targetGroup, pointCount)
      const from = alignClosedPathToReference(resampleClosedPath(source, pointCount), to)
      return { from, to }
    }),
  }
}

/**
 * Build a deterministic one-to-many split plan.
 *
 * Instead of duplicating the whole source into every target piece, the source is
 * partitioned by target-piece direction. This keeps split morphs readable and
 * avoids the "four full cursors separating" look for viewfinder-style states.
 */
export function buildSplitMotionPlan(sourceRaw: MorphPoint[], targetGroupsRaw: MorphPoint[][], pointCount = 120): SplitMotionPlan {
  const targetGroups = targetGroupsRaw.filter((group) => group.length >= 3)
  if (sourceRaw.length < 3 || !targetGroups.length) return { pairs: [], method: 'duplicate', confidence: 'low' }

  const count = Math.max(12, pointCount)
  const source = resampleClosedPath(sourceRaw, count)
  const sourceCenter = centroidOf(source)
  const targetCenter = centroidOf(targetGroups.flat())
  const targetAngles = targetGroups.map((group) => angleBetween(targetCenter, centroidOf(group)))
  const buckets: MorphPoint[][] = targetGroups.map(() => [])

  source.forEach((point) => {
    buckets[closestAngleIndex(angleBetween(sourceCenter, point), targetAngles)].push(point)
  })

  if (buckets.some((bucket) => bucket.length < 2)) return duplicateSplitPlan(source, targetGroups, count)

  return {
    method: 'partition',
    confidence: 'high',
    pairs: targetGroups.map((targetGroup, index) => {
      const partition = [sourceCenter, ...buckets[index], sourceCenter]
      const to = resampleClosedPath(targetGroup, count)
      const from = alignClosedPathToReference(resampleClosedPath(partition, count), to)
      return { from, to }
    }),
  }
}

// ---- Multi-shape / split morphing -------------------------------------------
// A "split" morph turns ONE source loop into N target loops. Multi-target splits
// use the deterministic source partitioner above, so a viewfinder transition
// reads as source regions becoming pieces instead of full duplicate cursors
// separating from the same outline.
export function morphMultiShape(source: MorphPoint[], targetGroups: MorphPoint[][], progress: number): MorphPoint[][] {
  if (targetGroups.length > 1) {
    const pointCount = Math.max(12, source.length, ...targetGroups.map((group) => group.length))
    const plan = buildSplitMotionPlan(source, targetGroups, pointCount)
    return plan.pairs.map((pair) => morphPointSets(pair.from, pair.to, progress))
  }

  return targetGroups.map((group) =>
    group.length === source.length ? morphPointSets(source, group, progress) : morphPointSets(source, resampleClosedPath(group, source.length), progress),
  )
}

// Align each target group to a reference source loop (rotation/winding) so the
// per-point correspondence is coherent. Do this once when a morph starts, not
// per frame.
export function alignGroupsToSource(groups: MorphPoint[][], source: MorphPoint[]): MorphPoint[][] {
  return groups.map((group) => alignClosedPathToReference(group, source))
}

// Render N sub-shapes as one SVG path string (each a closed sub-path). Works for
// the single-shape case too (N = 1).
export function multiShapeD(groups: MorphPoint[][], smooth = true, tension = 0.72): string {
  return groups
    .filter((group) => group.length >= 3)
    .map((group) => (smooth ? smoothClosedPathD(group, tension) : linearClosedPathD(group)))
    .join(' ')
}

export function linearClosedPathD(points: MorphPoint[], close = true) {
  if (!points.length) return ''
  const tail = close ? ' Z' : ''
  return `M ${formatMorphNumber(points[0].x)} ${formatMorphNumber(points[0].y)} ${points
    .slice(1)
    .map((point) => `L ${formatMorphNumber(point.x)} ${formatMorphNumber(point.y)}`)
    .join(' ')}${tail}`
}

export function smoothClosedPathD(points: MorphPoint[], tension = 0.72) {
  if (points.length < 3) return linearClosedPathD(points)
  const t = tension / 6
  let d = `M ${formatMorphNumber(points[0].x)} ${formatMorphNumber(points[0].y)}`

  for (let i = 0; i < points.length; i += 1) {
    const p0 = points[(i - 1 + points.length) % points.length]
    const p1 = points[i]
    const p2 = points[(i + 1) % points.length]
    const p3 = points[(i + 2) % points.length]
    const c1 = {
      x: p1.x + (p2.x - p0.x) * t,
      y: p1.y + (p2.y - p0.y) * t,
    }
    const c2 = {
      x: p2.x - (p3.x - p1.x) * t,
      y: p2.y - (p3.y - p1.y) * t,
    }
    d += ` C ${formatMorphNumber(c1.x)} ${formatMorphNumber(c1.y)}, ${formatMorphNumber(c2.x)} ${formatMorphNumber(c2.y)}, ${formatMorphNumber(p2.x)} ${formatMorphNumber(p2.y)}`
  }

  return `${d} Z`
}

export function smoothstep(progress: number) {
  return progress * progress * (3 - 2 * progress)
}

export function steppedProgress(progress: number, durationMs: number, fps: number) {
  const stepCount = Math.max(2, Math.round((durationMs / 1000) * fps))
  if (progress >= 1) return { progress: 1, step: stepCount }
  const step = Math.floor(progress * stepCount)
  return {
    progress: step / stepCount,
    step,
  }
}

// ---- Densify + open-path rendering -------------------------------------------
// Shared by the Morph Lab preview and the Drawable Scene runtime core so the two
// render through identical geometry.

// Uniform Catmull-Rom point on the p1->p2 segment (p0/p3 are the neighbours).
export function catmullRom(p0: MorphPoint, p1: MorphPoint, p2: MorphPoint, p3: MorphPoint, t: number): MorphPoint {
  const t2 = t * t
  const t3 = t2 * t
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  }
}

// Catmull-Rom densify of a closed loop: `perSeg` samples per original segment.
export function densifyClosedPath(points: MorphPoint[], perSeg = 6): MorphPoint[] {
  const n = points.length
  if (n < 3) return points.slice()
  const out: MorphPoint[] = []
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]
    const p1 = points[i]
    const p2 = points[(i + 1) % n]
    const p3 = points[(i + 2) % n]
    for (let s = 0; s < perSeg; s++) out.push(catmullRom(p0, p1, p2, p3, s / perSeg))
  }
  return out
}

// Open (unclosed) polyline path string, the counterpart to linearClosedPathD.
export function openPathD(points: MorphPoint[]): string {
  if (!points.length) return ''
  return `M ${formatMorphNumber(points[0].x)} ${formatMorphNumber(points[0].y)} ${points
    .slice(1)
    .map((p) => `L ${formatMorphNumber(p.x)} ${formatMorphNumber(p.y)}`)
    .join(' ')}`
}
