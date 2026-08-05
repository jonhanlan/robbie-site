import type { DrawableRenderOptions } from '../drawable/render'
import type { MorphRuntimeTimelineV2 } from '../drawable/runtime-contract'
import {
  sampleMorphRuntimeTimelineV2,
  type MorphRuntimeTimelineSampleV2,
} from './timeline-v2'

export const MORPH_RUNTIME_TIMELINE_HOST_INPUT_SCHEMA_V2 = 'morph-runtime-timeline-host-input/v2' as const

export type MorphRuntimeTimelineHostStatusV2 = 'paused' | 'playing'

export type MorphRuntimeTimelineHostStateV2 = {
  schema: typeof MORPH_RUNTIME_TIMELINE_HOST_INPUT_SCHEMA_V2
  timelineId: string
  status: MorphRuntimeTimelineHostStatusV2
  timeMs: number
  rate: number
  loop: boolean
  sample: MorphRuntimeTimelineSampleV2
}

export type MorphRuntimeTimelineHostInputV2 =
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'seek'; timeMs: number }
  | { type: 'rate'; rate: number }
  | { type: 'loop'; loop: boolean }
  | { type: 'advance'; deltaMs: number }

export function createMorphRuntimeTimelineHostStateV2(
  timeline: MorphRuntimeTimelineV2,
  options: {
    status?: MorphRuntimeTimelineHostStatusV2
    timeMs?: number
    rate?: number
    loop?: boolean
  } = {},
): MorphRuntimeTimelineHostStateV2 {
  const rate = finitePositiveRate(options.rate ?? 1)
  const loop = options.loop ?? timeline.loop === true
  return stateFor(timeline, {
    status: options.status ?? 'paused',
    timeMs: options.timeMs ?? 0,
    rate,
    loop,
  })
}

export function applyMorphRuntimeTimelineHostInputV2(
  timeline: MorphRuntimeTimelineV2,
  state: MorphRuntimeTimelineHostStateV2,
  input: MorphRuntimeTimelineHostInputV2,
): MorphRuntimeTimelineHostStateV2 {
  assertMatchingTimeline(timeline, state)
  switch (input.type) {
    case 'play': {
      const replayTime = !state.loop && state.timeMs >= timeline.durationMs ? 0 : state.timeMs
      return stateFor(timeline, { ...state, status: 'playing', timeMs: replayTime })
    }
    case 'pause':
      return stateFor(timeline, { ...state, status: 'paused' })
    case 'seek':
      return stateFor(timeline, { ...state, timeMs: finiteSeekTime(input.timeMs, timeline.durationMs) })
    case 'rate':
      return stateFor(timeline, { ...state, rate: finitePositiveRate(input.rate) })
    case 'loop':
      return stateFor(timeline, { ...state, loop: input.loop })
    case 'advance': {
      const deltaMs = finiteAdvanceDelta(input.deltaMs)
      if (state.status !== 'playing' || deltaMs === 0) return state
      const requestedTime = state.timeMs + (deltaMs * state.rate)
      if (!state.loop && requestedTime >= timeline.durationMs) {
        return stateFor(timeline, { ...state, status: 'paused', timeMs: timeline.durationMs })
      }
      return stateFor(timeline, { ...state, timeMs: requestedTime })
    }
  }
}

export function morphRuntimeRenderOptionsForTimelineHostStateV2(
  state: MorphRuntimeTimelineHostStateV2,
): Pick<DrawableRenderOptions, 'f' | 'state' | 'progress'> {
  return {
    f: state.sample.track.fromState,
    state: state.sample.track.toState,
    progress: state.sample.track.value,
  }
}

function stateFor(
  timeline: MorphRuntimeTimelineV2,
  values: Pick<MorphRuntimeTimelineHostStateV2, 'status' | 'timeMs' | 'rate' | 'loop'>,
): MorphRuntimeTimelineHostStateV2 {
  const effectiveTimeline = values.loop === (timeline.loop === true)
    ? timeline
    : { ...timeline, loop: values.loop }
  const sample = sampleMorphRuntimeTimelineV2(effectiveTimeline, values.timeMs)
  return {
    schema: MORPH_RUNTIME_TIMELINE_HOST_INPUT_SCHEMA_V2,
    timelineId: timeline.id,
    status: values.status,
    timeMs: sample.timeMs,
    rate: values.rate,
    loop: values.loop,
    sample,
  }
}

function assertMatchingTimeline(timeline: MorphRuntimeTimelineV2, state: MorphRuntimeTimelineHostStateV2): void {
  if (state.schema !== MORPH_RUNTIME_TIMELINE_HOST_INPUT_SCHEMA_V2 || state.timelineId !== timeline.id) {
    throw new Error('timeline host state does not belong to this timeline')
  }
}

function finitePositiveRate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) throw new Error('timeline host rate must be finite and greater than zero')
  return value
}

function finiteSeekTime(value: number, durationMs: number): number {
  if (!Number.isFinite(value)) throw new Error('timeline host seek timeMs must be finite')
  return Math.max(0, Math.min(durationMs, value))
}

function finiteAdvanceDelta(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new Error('timeline host advance deltaMs must be finite and nonnegative')
  return value
}
