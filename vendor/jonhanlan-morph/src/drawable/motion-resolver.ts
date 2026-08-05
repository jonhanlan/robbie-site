import type { DrawableLayer, DrawableScene, GeometryPrimitive } from './types'

export type DrawableMotionPrimitiveKind =
  | 'static'
  | 'closed-shape-morph'
  | 'open-stroke-motion'
  | 'multi-piece-object'
  | 'ribbon-write-on'
  | 'switch-only'
  | 'unsupported'

export type DrawableMotionCorrespondence =
  | 'none'
  | 'authored-anchors'
  | 'resample'
  | 'grouped-anchors'
  | 'stroke-order'
  | 'switch'

export type DrawableMotionResolution = {
  kind: DrawableMotionPrimitiveKind
  compatible: boolean
  correspondence: DrawableMotionCorrespondence
  warnings: string[]
  sourcePoints: number
  targetPoints: number
}

export type DrawableMotionWarning = {
  layerId: string
  stateId: string
  kind: DrawableMotionPrimitiveKind
  message: string
}

export function resolveDrawableMotionPrimitive(source: GeometryPrimitive, target?: GeometryPrimitive): DrawableMotionResolution {
  if (!target) {
    return resolution('static', true, 'none', source, source)
  }

  if (source.kind !== target.kind) {
    return resolution('switch-only', false, 'switch', source, target, [
      `Geometry kind changes from ${source.kind} to ${target.kind}; use a switch or authored bridge pose.`,
    ])
  }

  if (source.kind === 'closed' && target.kind === 'closed') {
    return resolution('closed-shape-morph', true, source.points.length === target.points.length ? 'authored-anchors' : 'resample', source, target)
  }

  if (source.kind === 'open' && target.kind === 'open') {
    return resolution('open-stroke-motion', true, source.points.length === target.points.length ? 'authored-anchors' : 'resample', source, target)
  }

  if (source.kind === 'multi' && target.kind === 'multi') {
    const sameGroupCount = source.groups.length === target.groups.length
    const sameGroupSizes = sameGroupCount && source.groups.every((group, index) => group.length === target.groups[index]?.length)
    return resolution(
      sameGroupCount ? 'multi-piece-object' : 'switch-only',
      sameGroupCount,
      sameGroupSizes ? 'grouped-anchors' : sameGroupCount ? 'resample' : 'switch',
      source,
      target,
      sameGroupCount ? [] : ['Multi geometry changes group count; keep it switch-only until partitioning is authored.'],
    )
  }

  if (source.kind === 'ribbon' && target.kind === 'ribbon') {
    const sameStrokeCount = source.strokes.length === target.strokes.length
    return resolution(
      sameStrokeCount ? 'ribbon-write-on' : 'switch-only',
      sameStrokeCount,
      sameStrokeCount ? 'stroke-order' : 'switch',
      source,
      target,
      sameStrokeCount ? [] : ['Ribbon geometry changes stroke count; use a switch or author stroke correspondence.'],
    )
  }

  return resolution('unsupported', false, 'switch', source, target, ['Unsupported geometry relationship.'])
}

export function resolveDrawableLayerStateMotion(layer: DrawableLayer, stateId: string): DrawableMotionResolution {
  return resolveDrawableMotionPrimitive(layer.geometry, layer.states?.[stateId])
}

export function analyzeDrawableSceneMotion(scene: DrawableScene): DrawableMotionWarning[] {
  return scene.layers.flatMap((layer) =>
    Object.keys(layer.states ?? {}).flatMap((stateId) => {
      const resolved = resolveDrawableLayerStateMotion(layer, stateId)
      if (resolved.compatible && resolved.warnings.length === 0) return []
      const warnings = resolved.warnings.length
        ? resolved.warnings
        : [`Layer "${layer.id}" state "${stateId}" resolves as ${resolved.kind}.`]
      return warnings.map((message) => ({
        layerId: layer.id,
        stateId,
        kind: resolved.kind,
        message,
      }))
    })
  )
}

function resolution(
  kind: DrawableMotionPrimitiveKind,
  compatible: boolean,
  correspondence: DrawableMotionCorrespondence,
  source: GeometryPrimitive,
  target: GeometryPrimitive,
  warnings: string[] = [],
): DrawableMotionResolution {
  return {
    kind,
    compatible,
    correspondence,
    warnings,
    sourcePoints: geometryPointCount(source),
    targetPoints: geometryPointCount(target),
  }
}

function geometryPointCount(geometry: GeometryPrimitive): number {
  if (geometry.kind === 'closed' || geometry.kind === 'open') return geometry.points.length
  if (geometry.kind === 'multi') return geometry.groups.reduce((sum, group) => sum + group.length, 0)
  return geometry.strokes.reduce((sum, stroke) => sum + stroke.length, 0)
}
