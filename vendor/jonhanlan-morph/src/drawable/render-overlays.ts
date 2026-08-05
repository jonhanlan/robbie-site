import {
  alignClosedPathToReference,
  resampleClosedPath,
} from '../geometry/morph-core'
import type { DrawableLayer, DrawablePoint } from './types'
import {
  renderMorphRuntimeDocumentV0,
  type DrawableRenderOptions,
} from './render'
import type { MorphRuntimeDocumentV0 } from './runtime-contract'

export type DrawableRenderOverlay = {
  fromState?: string | null
  state: string
  progress: number
}

export type DrawableOverlayRenderOptions = DrawableRenderOptions & {
  overlays?: DrawableRenderOverlay[]
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value))
}

function closedLayerStatePoints(layer: DrawableLayer, state?: string | null): DrawablePoint[] | null {
  if (!state) return layer.geometry.kind === 'closed' ? layer.geometry.points : null
  const geometry = layer.states?.[state]
  return geometry?.kind === 'closed' && geometry.points.length >= 3 ? geometry.points : null
}

export function composeDrawableRenderOverlaysV0(points: DrawablePoint[], layer: DrawableLayer, options?: DrawableOverlayRenderOptions): DrawablePoint[] {
  const overlays = options?.overlays
  if (!overlays?.length) return points

  let composed = points
  for (const overlay of overlays) {
    const progress = Number.isFinite(overlay.progress) ? clamp01(overlay.progress) : 0
    if (!overlay.state || progress <= 0) continue
    const fromSource = closedLayerStatePoints(layer, overlay.fromState)
    const toSource = closedLayerStatePoints(layer, overlay.state)
    if (!fromSource || !toSource) continue
    const from = fromSource.length === composed.length ? fromSource : resampleClosedPath(fromSource, composed.length)
    const to = alignClosedPathToReference(toSource.length === composed.length ? toSource : resampleClosedPath(toSource, composed.length), from)
    composed = composed.map((point, index) => ({
      x: point.x + (to[index].x - from[index].x) * progress,
      y: point.y + (to[index].y - from[index].y) * progress,
    }))
  }
  return composed
}

export function renderMorphRuntimeDocumentWithOverlaysV0(
  document: MorphRuntimeDocumentV0,
  options: DrawableOverlayRenderOptions = {},
): string {
  return renderMorphRuntimeDocumentV0(document, {
    ...options,
    composeKey: JSON.stringify(options.overlays ?? null),
    composePoints: composeDrawableRenderOverlaysV0,
  })
}
