/**
 * SVG path parser: tokenizes an SVG `d` string and samples curves/arcs to a flat
 * point list. This is the single source for SVG-string to points; all resample /
 * align / morph geometry lives in `morph-core`.
 */

type Point = [number, number]

// --- Tokenizer ---

const tokenize = (d: string): (string | number)[] => {
  const result: (string | number)[] = []
  const re = /([a-zA-Z])|(-?\d*\.?\d+(?:e[-+]?\d+)?)/g
  let match: RegExpExecArray | null
  while ((match = re.exec(d)) !== null) {
    if (match[1]) result.push(match[1])
    else if (match[2]) result.push(parseFloat(match[2]))
  }
  return result
}

// --- Bezier sampling ---

const cubicPoint = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
  const mt = 1 - t
  return [
    mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0],
    mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1],
  ]
}

const quadraticPoint = (p0: Point, p1: Point, p2: Point, t: number): Point => {
  const mt = 1 - t
  return [
    mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  ]
}

// --- SVG Path Parser ---

export function parsePathToPoints(d: string, sample = 8): Point[] {
  const tokens = tokenize(d)
  let cursor: Point = [0, 0]
  let start: Point = [0, 0]
  const points: Point[] = []
  let i = 0
  let cmd = ''
  let prevCurveCmd = ''
  let lastCubicControl: Point | null = null
  let lastQuadraticControl: Point | null = null

  const readNum = () => tokens[i++] as number
  const hasNums = (count: number) => {
    if (i + count > tokens.length) return false
    for (let j = 0; j < count; j++) {
      if (typeof tokens[i + j] === 'string') return false
    }
    return true
  }
  const reflect = (current: Point, control: Point | null): Point => {
    if (!control) return [...current] as Point
    return [current[0] * 2 - control[0], current[1] * 2 - control[1]]
  }

  const arcPoints = (
    from: Point, rx: number, ry: number, xRot: number,
    largeArc: number, sweep: number, to: Point, seg: number
  ): Point[] => {
    let arx = Math.abs(rx), ary = Math.abs(ry)
    const phi = (xRot * Math.PI) / 180
    const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi)
    if (arx === 0 || ary === 0 || (from[0] === to[0] && from[1] === to[1])) return [to]
    const dx2 = (from[0] - to[0]) / 2, dy2 = (from[1] - to[1]) / 2
    const x1p = cosPhi * dx2 + sinPhi * dy2, y1p = -sinPhi * dx2 + cosPhi * dy2
    const lambda = (x1p * x1p) / (arx * arx) + (y1p * y1p) / (ary * ary)
    if (lambda > 1) { const s = Math.sqrt(lambda); arx *= s; ary *= s }
    const rx2 = arx * arx, ry2 = ary * ary
    const sign = largeArc === sweep ? -1 : 1
    const num = Math.max(0, rx2 * ry2 - rx2 * y1p * y1p - ry2 * x1p * x1p)
    const den = rx2 * y1p * y1p + ry2 * x1p * x1p || 1
    const f = sign * Math.sqrt(num / den)
    const cxp = (f * arx * y1p) / ary, cyp = (-f * ary * x1p) / arx
    const cx = cosPhi * cxp - sinPhi * cyp + (from[0] + to[0]) / 2
    const cy = sinPhi * cxp + cosPhi * cyp + (from[1] + to[1]) / 2
    const angle = (ux: number, uy: number, vx: number, vy: number) => {
      const dot = ux * vx + uy * vy
      const len = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy)) || 1
      const a = Math.acos(Math.max(-1, Math.min(1, dot / len)))
      return ux * vy - uy * vx < 0 ? -a : a
    }
    const t1 = angle(1, 0, (x1p - cxp) / arx, (y1p - cyp) / ary)
    let dt = angle((x1p - cxp) / arx, (y1p - cyp) / ary, (-x1p - cxp) / arx, (-y1p - cyp) / ary)
    if (!sweep && dt > 0) dt -= Math.PI * 2
    if (sweep && dt < 0) dt += Math.PI * 2
    const out: Point[] = []
    for (let s = 1; s <= seg; s++) {
      const a = t1 + dt * (s / seg)
      out.push([cosPhi * arx * Math.cos(a) - sinPhi * ary * Math.sin(a) + cx,
                sinPhi * arx * Math.cos(a) + cosPhi * ary * Math.sin(a) + cy])
    }
    return out
  }

  while (i < tokens.length) {
    const token = tokens[i]
    if (typeof token === 'string') { cmd = token; i++ }
    else if (!cmd) { i++; continue }

    const rel = cmd === cmd.toLowerCase()
    const C = cmd.toUpperCase()

    switch (C) {
      case 'M': {
        if (!hasNums(2)) break
        const x = readNum(), y = readNum()
        cursor = rel ? [cursor[0] + x, cursor[1] + y] : [x, y]
        start = [...cursor] as Point
        points.push([...cursor] as Point)
        while (hasNums(2)) {
          const lx = readNum(), ly = readNum()
          cursor = rel ? [cursor[0] + lx, cursor[1] + ly] : [lx, ly]
          points.push([...cursor] as Point)
        }
        lastCubicControl = null; lastQuadraticControl = null; break
      }
      case 'L': {
        while (hasNums(2)) {
          const x = readNum(), y = readNum()
          cursor = rel ? [cursor[0] + x, cursor[1] + y] : [x, y]
          points.push([...cursor] as Point)
        }
        lastCubicControl = null; lastQuadraticControl = null; break
      }
      case 'H': {
        while (hasNums(1)) {
          const x = readNum()
          cursor = rel ? [cursor[0] + x, cursor[1]] : [x, cursor[1]]
          points.push([...cursor] as Point)
        }
        lastCubicControl = null; lastQuadraticControl = null; break
      }
      case 'V': {
        while (hasNums(1)) {
          const y = readNum()
          cursor = rel ? [cursor[0], cursor[1] + y] : [cursor[0], y]
          points.push([...cursor] as Point)
        }
        lastCubicControl = null; lastQuadraticControl = null; break
      }
      case 'C': {
        while (hasNums(6)) {
          const c1x = readNum(), c1y = readNum(), c2x = readNum(), c2y = readNum(), ex = readNum(), ey = readNum()
          const c1: Point = rel ? [cursor[0] + c1x, cursor[1] + c1y] : [c1x, c1y]
          const c2: Point = rel ? [cursor[0] + c2x, cursor[1] + c2y] : [c2x, c2y]
          const end: Point = rel ? [cursor[0] + ex, cursor[1] + ey] : [ex, ey]
          for (let t = 1; t <= sample; t++) points.push(cubicPoint(cursor, c1, c2, end, t / sample))
          cursor = end; lastCubicControl = c2; lastQuadraticControl = null
        }
        break
      }
      case 'S': {
        while (hasNums(4)) {
          const c2x = readNum(), c2y = readNum(), ex = readNum(), ey = readNum()
          const useRef = prevCurveCmd === 'C' || prevCurveCmd === 'S'
          const c1: Point = useRef ? reflect(cursor, lastCubicControl) : [...cursor] as Point
          const c2: Point = rel ? [cursor[0] + c2x, cursor[1] + c2y] : [c2x, c2y]
          const end: Point = rel ? [cursor[0] + ex, cursor[1] + ey] : [ex, ey]
          for (let t = 1; t <= sample; t++) points.push(cubicPoint(cursor, c1, c2, end, t / sample))
          cursor = end; lastCubicControl = c2; lastQuadraticControl = null; prevCurveCmd = 'S'
        }
        break
      }
      case 'Q': {
        while (hasNums(4)) {
          const cx = readNum(), cy = readNum(), ex = readNum(), ey = readNum()
          const c: Point = rel ? [cursor[0] + cx, cursor[1] + cy] : [cx, cy]
          const end: Point = rel ? [cursor[0] + ex, cursor[1] + ey] : [ex, ey]
          for (let t = 1; t <= sample; t++) points.push(quadraticPoint(cursor, c, end, t / sample))
          cursor = end; lastQuadraticControl = c; lastCubicControl = null; prevCurveCmd = 'Q'
        }
        break
      }
      case 'T': {
        while (hasNums(2)) {
          const ex = readNum(), ey = readNum()
          const useRef = prevCurveCmd === 'Q' || prevCurveCmd === 'T'
          const c: Point = useRef ? reflect(cursor, lastQuadraticControl) : [...cursor] as Point
          const end: Point = rel ? [cursor[0] + ex, cursor[1] + ey] : [ex, ey]
          for (let t = 1; t <= sample; t++) points.push(quadraticPoint(cursor, c, end, t / sample))
          cursor = end; lastQuadraticControl = c; lastCubicControl = null; prevCurveCmd = 'T'
        }
        break
      }
      case 'A': {
        while (hasNums(7)) {
          const rx = readNum(), ry = readNum(), xr = readNum(), la = readNum(), sf = readNum(), ex = readNum(), ey = readNum()
          const end: Point = rel ? [cursor[0] + ex, cursor[1] + ey] : [ex, ey]
          points.push(...arcPoints(cursor, rx, ry, xr, la ? 1 : 0, sf ? 1 : 0, end, sample))
          cursor = end; lastCubicControl = null; lastQuadraticControl = null; prevCurveCmd = ''
        }
        break
      }
      case 'Z': {
        cursor = [...start] as Point
        points.push([...cursor] as Point)
        lastCubicControl = null; lastQuadraticControl = null; prevCurveCmd = ''; break
      }
      default: if (typeof tokens[i] !== 'string') i++; break
    }
    if (C === 'C' && lastCubicControl) prevCurveCmd = 'C'
    if (C === 'L' || C === 'H' || C === 'V' || C === 'M') prevCurveCmd = ''
  }

  return points
}
