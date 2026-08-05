import {
  MORPH_RUNTIME_FIELD_CACHE_POLICY_V0,
  type MorphRuntimeDocumentV0,
  type MorphRuntimeFieldCachePolicyV0,
} from './runtime-contract'

export const DEFAULT_FIELD_CACHE_PROGRESS_EPSILON = 0.0001

export { MORPH_RUNTIME_FIELD_CACHE_POLICY_V0, type MorphRuntimeFieldCachePolicyV0 }
export type MorphRuntimeFieldCacheSourceV0 = 'none' | 'rest-cache' | 'sample-cache' | 'state-cache' | 'live-fallback'

export type MorphRuntimeFieldCacheStatusV0 = {
  policy: MorphRuntimeFieldCachePolicyV0
  source: MorphRuntimeFieldCacheSourceV0
  state: string | null
  progress: number
  cachedProgresses: number[]
  matchingLayers: number
}

export type MorphRuntimeFieldCacheStatusOptionsV0 = {
  state?: string | null
  progress?: number
  epsilon?: number
}

export function morphRuntimeFieldCacheStatusV0(
  document: MorphRuntimeDocumentV0,
  options: MorphRuntimeFieldCacheStatusOptionsV0 = {},
): MorphRuntimeFieldCacheStatusV0 {
  const epsilon = nonNegative(options.epsilon, DEFAULT_FIELD_CACHE_PROGRESS_EPSILON)
  const progress = clamp01(options.progress ?? 0)
  const state = progress > epsilon ? options.state ?? null : null
  const cachedProgresses = morphRuntimeCachedFieldProgressesV0(document, state)
  const layers = document.cache?.fields?.layers ?? []
  const policy = document.cache?.fields?.policy ?? MORPH_RUNTIME_FIELD_CACHE_POLICY_V0
  const matchingLayers = layers.filter((layer) => {
    if (state === null) return layer.state === null && closeTo(layer.progress, 0, epsilon) && closeTo(progress, 0, epsilon)
    return layer.state === state && closeTo(layer.progress, progress, epsilon)
  }).length

  return {
    policy,
    source: fieldCacheSourceFor(progress, state, matchingLayers, layers.length, epsilon),
    state,
    progress,
    cachedProgresses,
    matchingLayers,
  }
}

export function morphRuntimeCachedFieldProgressesV0(document: MorphRuntimeDocumentV0, state?: string | null): number[] {
  const values = new Set<number>()
  for (const layer of document.cache?.fields?.layers ?? []) {
    if (layer.state === null && closeTo(layer.progress, 0, DEFAULT_FIELD_CACHE_PROGRESS_EPSILON)) values.add(0)
    if (state && layer.state === state) values.add(cacheProgressNumber(layer.progress))
  }
  return [...values].sort((a, b) => a - b)
}

export function morphRuntimeFieldCacheSourceLabelV0(source: MorphRuntimeFieldCacheSourceV0): string {
  switch (source) {
    case 'rest-cache':
      return 'rest cache'
    case 'sample-cache':
      return 'sample cache'
    case 'state-cache':
      return 'state cache'
    case 'live-fallback':
      return 'live fallback'
    case 'none':
      return 'no compiled cache'
  }
}

function fieldCacheSourceFor(
  progress: number,
  state: string | null,
  matchingLayers: number,
  cachedLayerCount: number,
  epsilon: number,
): MorphRuntimeFieldCacheSourceV0 {
  if (cachedLayerCount <= 0) return 'none'
  if (matchingLayers <= 0) return 'live-fallback'
  if (state === null || closeTo(progress, 0, epsilon)) return 'rest-cache'
  if (closeTo(progress, 1, epsilon)) return 'state-cache'
  return 'sample-cache'
}

function cacheProgressNumber(progress: number) {
  return Number(progress.toFixed(4))
}

function closeTo(value: number, target: number, epsilon: number) {
  return Math.abs(value - target) <= epsilon
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(1, value))
}

function nonNegative(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : fallback
}
