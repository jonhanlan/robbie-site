import {
  renderDrawableScene,
  resolveDrawableLayerPlaybackGeometry,
  type DrawableRenderCache,
} from '../drawable/render'
import type { DrawableScene } from '../drawable/types'
import type { MorphRuntimeDocumentV2 } from '../drawable/runtime-contract'
import {
  applyMorphRuntimeTimelineLayerTransformsV2,
  sampleMorphRuntimeTimelineV2,
  type MorphRuntimeTimelineSampleV2,
} from './timeline-v2'

export type MorphRuntimeTimelineFrameOptionsV2 = {
  frame?: number
  /** Renderer boil time. Timeline sampling remains controlled by the separate timelineTimeMs argument. */
  renderTimeMs?: number
  cache?: DrawableRenderCache
}

export type MorphRuntimeTimelineFrameV2 = {
  sample: MorphRuntimeTimelineSampleV2
  scene: DrawableScene
  markup: string
  nonblank: boolean
}

/** Resolves state motion first, then applies rigid layer lanes to the resolved geometry. */
export function renderMorphRuntimeTimelineFrameV2(
  document: MorphRuntimeDocumentV2,
  timelineTimeMs: number,
  options: MorphRuntimeTimelineFrameOptionsV2 = {},
): MorphRuntimeTimelineFrameV2 {
  const sample = sampleMorphRuntimeTimelineV2(document.timeline, timelineTimeMs)
  const renderState = {
    f: sample.track.fromState,
    state: sample.track.toState,
    progress: sample.track.value,
    frame: options.frame ?? 0,
    timeMs: options.renderTimeMs,
  }
  const resolvedScene: DrawableScene = {
    ...document.scene,
    layers: document.scene.layers.map((layer) => {
      const { states: _states, ...resolvedLayer } = layer
      return {
        ...resolvedLayer,
        geometry: resolveDrawableLayerPlaybackGeometry(layer, renderState),
      }
    }),
  }
  const scene = applyMorphRuntimeTimelineLayerTransformsV2(resolvedScene, sample.layerTransforms)
  const markup = renderDrawableScene(scene, {
    cache: options.cache,
    frame: options.frame ?? 0,
    timeMs: options.renderTimeMs,
  })
  return {
    sample,
    scene,
    markup,
    nonblank: markup.length > 1000 && (markup.includes('<path') || markup.includes('<image')),
  }
}
