import { clamp01, type FieldSample } from './field-engine'

export const MORPH_FIELD_MARK_KINDS_V0 = ['dots', 'stipple', 'hatch', 'cross', 'grain', 'scratch', 'flow', 'dry'] as const

export type MorphFieldMarkKindV0 = typeof MORPH_FIELD_MARK_KINDS_V0[number]

export type MorphFieldMarkGrammarConfigV0 = {
  kind?: MorphFieldMarkKindV0
  density?: number
  size?: number
  opacity?: number
  angleDeg?: number
  length?: number
  jitter?: number
  contourAlign?: number
  threshold?: number
}

export type MorphFieldMarkRenderSampleV0 = {
  kind: MorphFieldMarkKindV0
  keep: boolean
  density01: number
  size: number
  opacity: number
  angleRad: number
  length: number
  secondaryAngleRad?: number
}

const TAU = Math.PI * 2

export function resolveMorphFieldMarkSampleV0(
  sample: FieldSample,
  config: MorphFieldMarkGrammarConfigV0 = {},
): MorphFieldMarkRenderSampleV0 {
  const kind = config.kind ?? 'dots'
  const densityScale = positive(config.density, 1)
  const sizeScale = positive(config.size, 1)
  const opacityScale = positive(config.opacity, 1)
  const threshold = clamp01(config.threshold ?? 0.02)
  const jitter = clamp01(config.jitter ?? 0)
  const contourAlign = clamp01(config.contourAlign ?? 0)
  let densityStyle = 1
  let sizeStyle = 1
  let opacityStyle = 1
  let lengthStyle = 0
  if (kind === 'stipple') {
    densityStyle = 0.72
    sizeStyle = 0.58
    opacityStyle = 0.86
  } else if (kind === 'grain') {
    densityStyle = 1.28
    sizeStyle = 0.38
    opacityStyle = 0.62
    lengthStyle = 0.36
  } else if (kind === 'hatch') {
    densityStyle = 0.9
    sizeStyle = 0.78
    opacityStyle = 0.9
    lengthStyle = 1.8
  } else if (kind === 'cross') {
    densityStyle = 0.82
    sizeStyle = 0.72
    opacityStyle = 0.82
    lengthStyle = 1.55
  } else if (kind === 'scratch' || kind === 'dry') {
    densityStyle = 0.5
    sizeStyle = 0.5
    opacityStyle = 0.7
    lengthStyle = 2.3
  } else if (kind === 'flow') {
    densityStyle = 0.62
    sizeStyle = 0.64
    opacityStyle = 0.8
    lengthStyle = 2
  }
  const density01 = clamp01(sample.markDensity01 * densityScale * densityStyle)
  const size = Math.max(0.05, sample.markSize01 * sizeScale * sizeStyle)
  const opacity = clamp01(sample.markOpacity01 * opacityScale * opacityStyle)
  const angleRad = markAngleRad(sample, config.angleDeg ?? 0, contourAlign, jitter)
  const length = markLength(sample, positive(config.length, 1), lengthStyle)
  const result: MorphFieldMarkRenderSampleV0 = {
    kind,
    keep: density01 >= threshold && opacity > 0.001 && size > 0.001,
    density01,
    size,
    opacity,
    angleRad,
    length,
  }
  if (kind === 'cross') result.secondaryAngleRad = angleRad + Math.PI * 0.5
  return result
}

function markAngleRad(sample: FieldSample, angleDeg: number, contourAlign: number, jitter: number) {
  const baseTurns = angleDeg / 360
  const fieldTurn = (sample.direction01 - 0.5) * contourAlign * 0.5
  const noiseTurn = (sample.noise01 - 0.5) * jitter * 0.22
  return (baseTurns + fieldTurn + noiseTurn) * TAU
}

function markLength(sample: FieldSample, lengthScale: number, styleLength: number) {
  if (styleLength <= 0) return 0
  return Math.max(0.5, styleLength * lengthScale * (0.42 + sample.tone01 * 0.9) * sample.markSize01)
}

function positive(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}
