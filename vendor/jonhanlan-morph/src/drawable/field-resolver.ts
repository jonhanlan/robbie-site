import type { MorphPoint } from '../geometry/morph-core'
import { createContourField, hydrateContourField, type ContourField } from './field-engine'
import type { MorphRuntimeFieldCacheV0 } from './runtime-contract'

export type DrawableFieldResolverStats = {
  contourFieldCacheHits: number
  contourFieldCacheMisses: number
  runtimeFieldCacheHits: number
  runtimeFieldCacheMisses: number
}

export type DrawableFieldResolverCache = {
  contourFields: Map<string, ContourField>
  maxEntries: number
}

export type DrawableFieldResolverOptions = {
  cache?: DrawableFieldResolverCache
  fieldCache?: MorphRuntimeFieldCacheV0
  stats?: DrawableFieldResolverStats
}

function rememberContourField(cache: DrawableFieldResolverCache, key: string, value: ContourField) {
  cache.contourFields.set(key, value)
  if (cache.contourFields.size > cache.maxEntries) {
    const oldest = cache.contourFields.keys().next().value
    if (oldest !== undefined) cache.contourFields.delete(oldest)
  }
  return value
}

export function resolveDrawableContourField(core: MorphPoint[], geometryKey: string, options?: DrawableFieldResolverOptions) {
  const cache = options?.cache
  const stats = options?.stats
  const key = `contour-field|${geometryKey}`
  if (cache) {
    const cached = cache.contourFields.get(key)
    if (cached) {
      if (stats) stats.contourFieldCacheHits++
      return cached
    }
  }

  const runtimeField = resolveRuntimeContourField(geometryKey, options)
  if (runtimeField) {
    if (stats) stats.contourFieldCacheHits++
    return cache ? rememberContourField(cache, key, runtimeField) : runtimeField
  }

  if (stats) stats.contourFieldCacheMisses++
  if (!cache) return createContourField(core)
  return rememberContourField(cache, key, createContourField(core))
}

function resolveRuntimeContourField(geometryKey: string, options?: DrawableFieldResolverOptions): ContourField | undefined {
  const fieldCache = options?.fieldCache
  const stats = options?.stats
  if (!fieldCache) return undefined
  const layer = fieldCache.layers.find((candidate) => candidate.renderKey === geometryKey)
  if (!layer) {
    if (stats) stats.runtimeFieldCacheMisses++
    return undefined
  }
  if (stats) stats.runtimeFieldCacheHits++
  return hydrateContourField(layer.contour)
}
