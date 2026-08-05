import type {
  MorphRuntimeTimelineAnyTrackV2,
  MorphRuntimeTimelineEasingV2,
  MorphRuntimeTimelineLayerTransformTrackV2,
  MorphRuntimeTimelineV2,
} from '../drawable/runtime-contract'
import type { DrawablePoint, DrawableScene, GeometryPrimitive, StrokePoint } from '../drawable/types'

export {
  MORPH_RUNTIME_SCHEMA_V2,
  MORPH_RUNTIME_VERSION_V2,
  createMorphRuntimeDocumentV2,
  isMorphRuntimeDocumentV2,
  validateMorphRuntimeDocumentV2,
  type MorphRuntimeDocumentOptionsV2,
  type MorphRuntimeDocumentV2,
  type MorphRuntimeMigrationV2,
  type MorphRuntimeSchemaV2,
  type MorphRuntimeTimelineEasingV2,
  type MorphRuntimeTimelineKeyframeV2,
  type MorphRuntimeTimelineAnyTrackV2,
  type MorphRuntimeTimelineLayerTransformPropertyV2,
  type MorphRuntimeTimelineLayerTransformTargetV2,
  type MorphRuntimeTimelineLayerTransformTrackV2,
  type MorphRuntimeTimelineStateProgressTargetV2,
  type MorphRuntimeTimelineTrackV2,
  type MorphRuntimeTimelineV2,
  type MorphRuntimeVersionV2,
} from '../drawable/runtime-contract'

export type MorphRuntimeTimelineTrackSampleV2 = {
  trackId: string
  value: number
  fromState: string
  toState: string
}

export type MorphRuntimeTimelineSampleV2 = {
  timelineId: string
  timeMs: number
  progress: number
  ended: boolean
  track: MorphRuntimeTimelineTrackSampleV2
  layerTransforms: MorphRuntimeTimelineLayerTransformSampleV2[]
}

export type MorphRuntimeTimelineLayerTransformSampleV2 = {
  layerId: string
  translateX?: number
  translateY?: number
  rotationDeg?: number
}

export function sampleMorphRuntimeTimelineV2(
  timeline: MorphRuntimeTimelineV2,
  requestedTimeMs: number,
): MorphRuntimeTimelineSampleV2 {
  if (!Number.isFinite(timeline.durationMs) || timeline.durationMs <= 0) {
    throw new Error('timeline durationMs must be finite and greater than zero')
  }
  const track = timeline.tracks[0]
  if (!track || track.target.kind !== 'state-progress') throw new Error('timeline requires the state-progress track first')
  const timeMs = normalizedTime(requestedTimeMs, timeline.durationMs, timeline.loop === true)
  return {
    timelineId: timeline.id,
    timeMs,
    progress: timeMs / timeline.durationMs,
    ended: timeline.loop !== true && requestedTimeMs >= timeline.durationMs,
    track: {
      trackId: track.id,
      value: sampleTrack(track, timeMs),
      fromState: track.target.fromState,
      toState: track.target.toState,
    },
    layerTransforms: sampleLayerTransforms(
      timeline.tracks.slice(1).filter((candidate): candidate is MorphRuntimeTimelineLayerTransformTrackV2 =>
        candidate.target.kind === 'layer-transform'),
      timeMs,
    ),
  }
}

function sampleLayerTransforms(
  tracks: MorphRuntimeTimelineLayerTransformTrackV2[],
  timeMs: number,
): MorphRuntimeTimelineLayerTransformSampleV2[] {
  const samples = new Map<string, MorphRuntimeTimelineLayerTransformSampleV2>()
  for (const track of tracks) {
    const sample = samples.get(track.target.layerId) ?? { layerId: track.target.layerId }
    sample[track.target.property] = sampleTrack(track, timeMs)
    samples.set(track.target.layerId, sample)
  }
  return [...samples.values()]
}

function sampleTrack(track: MorphRuntimeTimelineAnyTrackV2, timeMs: number): number {
  const keys = track.keyframes
  if (!keys.length) return 0
  if (timeMs <= keys[0].timeMs) return keys[0].value
  const last = keys[keys.length - 1]
  if (timeMs >= last.timeMs) return last.value
  for (let index = 0; index < keys.length - 1; index += 1) {
    const from = keys[index]
    const to = keys[index + 1]
    if (timeMs > to.timeMs) continue
    const span = to.timeMs - from.timeMs
    const local = span <= 0 ? 1 : (timeMs - from.timeMs) / span
    const eased = easeTimelineProgressV2(local, from.easing ?? 'linear')
    return from.value + ((to.value - from.value) * eased)
  }
  return last.value
}

/** Applies samples to a scene whose layer geometries have already been resolved for state/progress. */
export function applyMorphRuntimeTimelineLayerTransformsV2(
  scene: DrawableScene,
  samples: readonly MorphRuntimeTimelineLayerTransformSampleV2[],
): DrawableScene {
  if (samples.length === 0) return scene
  const byLayerId = new Map(samples.map((sample) => [sample.layerId, sample]))
  return {
    ...scene,
    layers: scene.layers.map((layer) => {
      const sample = byLayerId.get(layer.id)
      if (!sample) return layer
      return { ...layer, geometry: applyMorphRuntimeTimelineLayerTransformToGeometryV2(layer.geometry, sample) }
    }),
  }
}

/** Rotates one resolved geometry around its bounds center, then translates it. */
export function applyMorphRuntimeTimelineLayerTransformToGeometryV2(
  geometry: GeometryPrimitive,
  sample: MorphRuntimeTimelineLayerTransformSampleV2,
): GeometryPrimitive {
  const points = geometryPoints(geometry)
  if (points.length === 0) return geometry
  const bounds = points.reduce((result, point) => ({
    minX: Math.min(result.minX, point.x),
    minY: Math.min(result.minY, point.y),
    maxX: Math.max(result.maxX, point.x),
    maxY: Math.max(result.maxY, point.y),
  }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity })
  const centerX = (bounds.minX + bounds.maxX) / 2
  const centerY = (bounds.minY + bounds.maxY) / 2
  const radians = (sample.rotationDeg ?? 0) * Math.PI / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const translateX = sample.translateX ?? 0
  const translateY = sample.translateY ?? 0
  const transformPoint = <Point extends DrawablePoint>(point: Point): Point => {
    const x = point.x - centerX
    const y = point.y - centerY
    return {
      ...point,
      x: centerX + (x * cos) - (y * sin) + translateX,
      y: centerY + (x * sin) + (y * cos) + translateY,
    }
  }
  switch (geometry.kind) {
    case 'closed': return { ...geometry, points: geometry.points.map(transformPoint) }
    case 'open': return { ...geometry, points: geometry.points.map(transformPoint) }
    case 'multi': return { ...geometry, groups: geometry.groups.map((group) => group.map(transformPoint)) }
    case 'ribbon': return { ...geometry, strokes: geometry.strokes.map((stroke) => stroke.map(transformPoint<StrokePoint>)) }
  }
}

function geometryPoints(geometry: GeometryPrimitive): DrawablePoint[] {
  switch (geometry.kind) {
    case 'closed': return geometry.points
    case 'open': return geometry.points
    case 'multi': return geometry.groups.flat()
    case 'ribbon': return geometry.strokes.flat()
  }
}

export function easeTimelineProgressV2(progress: number, easing: MorphRuntimeTimelineEasingV2): number {
  const t = Math.max(0, Math.min(1, progress))
  switch (easing) {
    case 'hold': return 0
    case 'ease-in': return t * t
    case 'ease-out': return 1 - ((1 - t) * (1 - t))
    case 'ease-in-out': return t < 0.5 ? 2 * t * t : 1 - (Math.pow(-2 * t + 2, 2) / 2)
    case 'smoothstep': return t * t * (3 - (2 * t))
    case 'linear': return t
  }
}

function normalizedTime(timeMs: number, durationMs: number, loop: boolean): number {
  if (!Number.isFinite(timeMs) || timeMs <= 0) return 0
  if (!loop) return Math.min(durationMs, timeMs)
  return timeMs % durationMs
}
