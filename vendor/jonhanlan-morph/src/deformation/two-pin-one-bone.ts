export type DeformationPoint = {
  x: number
  y: number
  w?: number
  t?: number
}

export type PressureRibbonGeometry<Point extends DeformationPoint = DeformationPoint> = {
  kind: 'ribbon'
  strokes: ReadonlyArray<ReadonlyArray<Point>>
  style?: unknown
}

export type TwoPinOneBoneDeformationInput<Geometry extends PressureRibbonGeometry> = {
  geometry: Geometry
  root: Readonly<DeformationPoint>
  tip: Readonly<DeformationPoint>
  posedTip: Readonly<DeformationPoint>
  radius: number
  /** Positive exponent applied to the smooth radial response. `1` is neutral. */
  falloff: number
}

const finitePoint = (point: Readonly<DeformationPoint>): boolean => (
  Number.isFinite(point.x)
  && Number.isFinite(point.y)
  && (point.w === undefined || Number.isFinite(point.w))
  && (point.t === undefined || Number.isFinite(point.t))
)

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

const smoothstep01 = (value: number): number => {
  const t = clamp01(value)
  return t * t * (3 - 2 * t)
}

/**
 * Small authoring-time deformation oracle for a pressure ribbon influenced by
 * one root-to-tip bone. This is deterministic geometry math, not an IK solver.
 */
export function deformPressureRibbonWithTwoPinOneBone<
  Point extends DeformationPoint,
  Geometry extends PressureRibbonGeometry<Point>,
>(input: TwoPinOneBoneDeformationInput<Geometry>): Geometry {
  const { geometry, root, tip, posedTip, radius, falloff } = input

  if (!finitePoint(root) || !finitePoint(tip) || !finitePoint(posedTip)) {
    throw new Error('Two-pin deformation requires finite root, tip, and posedTip coordinates.')
  }
  if (!Number.isFinite(radius) || radius <= 0) {
    throw new Error('Two-pin deformation radius must be finite and greater than zero.')
  }
  if (!Number.isFinite(falloff) || falloff <= 0) {
    throw new Error('Two-pin deformation falloff must be finite and greater than zero.')
  }

  const restX = tip.x - root.x
  const restY = tip.y - root.y
  const posedX = posedTip.x - root.x
  const posedY = posedTip.y - root.y
  const restLength = Math.hypot(restX, restY)
  const posedLength = Math.hypot(posedX, posedY)

  if (restLength <= 0 || posedLength <= 0) {
    throw new Error('Two-pin deformation requires non-zero rest and posed bone lengths.')
  }

  const ux = restX / restLength
  const uy = restY / restLength
  const vx = -uy
  const vy = ux
  const posedUx = posedX / posedLength
  const posedUy = posedY / posedLength
  const posedVx = -posedUy
  const posedVy = posedUx

  const strokes = geometry.strokes.map((stroke) => stroke.map((point) => {
    if (!finitePoint(point)) {
      throw new Error('Two-pin deformation geometry requires finite point coordinates.')
    }

    const localX = point.x - root.x
    const localY = point.y - root.y
    const axial = (localX * ux + localY * uy) / restLength
    const radial = localX * vx + localY * vy
    const mappedAxial = axial * posedLength
    const mappedX = root.x + posedUx * mappedAxial + posedVx * radial
    const mappedY = root.y + posedUy * mappedAxial + posedVy * radial

    const axialInfluence = smoothstep01(axial)
    const radialBase = smoothstep01(1 - Math.abs(radial) / radius)
    const influence = axialInfluence * Math.pow(radialBase, falloff)

    return {
      ...point,
      x: point.x + (mappedX - point.x) * influence,
      y: point.y + (mappedY - point.y) * influence,
    } as Point
  }))

  return {
    ...geometry,
    strokes,
  }
}
