import {
  renderMorphRuntimeDocumentV0,
  renderMorphRuntimeDocumentWithOverlaysV0,
  type DrawableRenderCache,
} from './index'
import {
  MORPH_RUNTIME_SCHEMA_V2,
  type MorphRuntimeDocument,
  type MorphRuntimeDocumentV0,
} from '../drawable/runtime-contract'
import { renderMorphRuntimeTimelineFrameV2 } from './timeline-frame-renderer-v2'
import {
  morphRuntimePlayerOverlayTransitionForTriggerV0,
  morphRuntimePlayerRenderStateForControllerValuesV0,
  type MorphRuntimePlayerControllerValuesV0,
  type MorphRuntimePlayerOverlayStateV0,
  type MorphRuntimePlayerRenderStateV0,
} from './player-state'

export type MorphRuntimeWebviewFrameInputV0 = {
  controllerValues?: MorphRuntimePlayerControllerValuesV0
  triggerStates?: Record<string, boolean | number | null | undefined>
  overlayTriggers?: Record<string, number | boolean | null | undefined>
  state?: string | null
  fromState?: string | null
  progress?: number
  frame?: number
  timeMs?: number
  /** Explicit timeline position. Separate from timeMs, which remains renderer boil time. */
  timelineTimeMs?: number
  cache?: DrawableRenderCache
}

export type MorphRuntimeWebviewFrameV0 = {
  markup: string
  renderState: MorphRuntimePlayerRenderStateV0
  overlays: MorphRuntimePlayerOverlayStateV0[]
  nonblank: boolean
}

export function renderMorphRuntimeWebviewFrameV0(
  document: MorphRuntimeDocument,
  input: MorphRuntimeWebviewFrameInputV0 = {},
): MorphRuntimeWebviewFrameV0 {
  const renderState = morphRuntimeWebviewRenderStateV0(document, input)
  const overlays = morphRuntimeWebviewOverlayStatesV0(document, input.overlayTriggers)
  if (document.schema === MORPH_RUNTIME_SCHEMA_V2 && input.timelineTimeMs != null && overlays.length === 0) {
    const timelineFrame = renderMorphRuntimeTimelineFrameV2(document, input.timelineTimeMs, {
      cache: input.cache,
      frame: input.frame,
      renderTimeMs: input.timeMs,
    })
    return {
      markup: timelineFrame.markup,
      renderState: {
        fromState: timelineFrame.sample.track.fromState,
        state: timelineFrame.sample.track.toState,
        progress: timelineFrame.sample.track.value,
        phase: timelineFrame.sample.track.value >= 1 ? 'settled' : 'enter',
      },
      overlays,
      nonblank: timelineFrame.nonblank,
    }
  }
  const options = {
    cache: input.cache,
    frame: input.frame,
    timeMs: input.timeMs,
    fromState: renderState.fromState ?? undefined,
    state: renderState.state ?? undefined,
    progress: renderState.progress,
  }
  const markup = overlays.length
    ? renderMorphRuntimeDocumentWithOverlaysV0(document as MorphRuntimeDocumentV0, {
        ...options,
        overlays,
      })
    : renderMorphRuntimeDocumentV0(document as MorphRuntimeDocumentV0, options)

  return {
    markup,
    renderState,
    overlays,
    nonblank: markup.length > 1000 && (markup.includes('<path') || markup.includes('<image')),
  }
}

export function morphRuntimeWebviewRenderStateV0(
  document: MorphRuntimeDocument,
  input: MorphRuntimeWebviewFrameInputV0 = {},
): MorphRuntimePlayerRenderStateV0 {
  const controllerState = morphRuntimePlayerRenderStateForControllerValuesV0(document.scene, input.controllerValues)
  if (controllerState) return controllerState

  const triggerState = morphRuntimeWebviewTriggerRenderStateV0(document, input.triggerStates)
  if (triggerState) return triggerState

  return {
    fromState: input.fromState ?? null,
    state: input.state ?? null,
    progress: clamp01(input.progress ?? (input.state ? 1 : 0)),
    phase: input.state ? 'settled' : 'rest',
  }
}

export function morphRuntimeWebviewOverlayStatesV0(
  document: MorphRuntimeDocument,
  overlayTriggers: MorphRuntimeWebviewFrameInputV0['overlayTriggers'],
): MorphRuntimePlayerOverlayStateV0[] {
  if (!overlayTriggers) return []
  const overlays: MorphRuntimePlayerOverlayStateV0[] = []
  for (const [trigger, rawProgress] of Object.entries(overlayTriggers)) {
    const progress = typeof rawProgress === 'boolean'
      ? (rawProgress ? 1 : 0)
      : clamp01(rawProgress ?? 0)
    if (progress <= 0) continue
    const transition = morphRuntimePlayerOverlayTransitionForTriggerV0(document.scene, trigger)
    if (!transition?.to) continue
    overlays.push({
      trigger,
      fromState: transition.from && transition.from !== '*' ? transition.from : null,
      state: transition.to,
      progress,
      phase: progress >= 1 ? 'settled' : 'enter',
    })
  }
  return overlays
}

function morphRuntimeWebviewTriggerRenderStateV0(
  document: MorphRuntimeDocument,
  triggerStates: MorphRuntimeWebviewFrameInputV0['triggerStates'],
): MorphRuntimePlayerRenderStateV0 | null {
  if (!triggerStates) return null
  const transitions = document.scene.transitions ?? []
  for (const [trigger, rawProgress] of Object.entries(triggerStates)) {
    const progress = typeof rawProgress === 'boolean'
      ? (rawProgress ? 1 : 0)
      : clamp01(rawProgress ?? 0)
    if (progress <= 0) continue
    const transition = transitions.find((item) => item.trigger === trigger && item.to && item.to !== document.scene.entry)
    if (!transition?.to) continue
    return {
      fromState: transition.from && transition.from !== '*' ? transition.from : null,
      state: transition.to,
      progress,
      phase: progress >= 1 ? 'settled' : 'enter',
      controllerId: trigger,
      controllerValue: progress,
    }
  }
  return null
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}
