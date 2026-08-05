import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'
import { morphRuntimeCachedFieldProgressesV0 } from '../drawable/runtime-playback-policy'

export type MorphRuntimeArtifactSummaryV0 = {
  sceneId: string
  exportedAt: string
  latestGeneratedAt: string
  byteLength?: number
  renderTier?: string
  quality?: string
  generatedIds: string[]
  requiredCapabilities: string[]
  optionalCapabilities: string[]
  capabilities: string[]
  reducedMotionFallback?: string
  boilMode?: string
  controllers: string[]
  fieldCacheLayerCount: number
  cachedProgresses: number[]
}

export function morphRuntimeArtifactSummaryV0(
  document: MorphRuntimeDocumentV0,
  options: {
    byteLength?: number
    cacheState?: string
  } = {},
): MorphRuntimeArtifactSummaryV0 {
  return {
    sceneId: document.scene.id,
    exportedAt: document.exportedAt,
    latestGeneratedAt: latestRuntimeArtifactDateV0(document),
    byteLength: options.byteLength,
    renderTier: document.renderTier,
    quality: document.quality,
    generatedIds: (document.generated ?? []).map((artifact) => artifact.id),
    requiredCapabilities: document.capabilities?.required ?? [],
    optionalCapabilities: document.capabilities?.optional ?? [],
    capabilities: [
      ...(document.capabilities?.required ?? []),
      ...(document.capabilities?.optional ?? []),
    ],
    reducedMotionFallback: document.fallbacks?.reducedMotion,
    boilMode: document.settings?.boil,
    controllers: (document.controllers ?? []).map((controller) => `${controller.id}:${controller.type}`),
    fieldCacheLayerCount: document.cache?.fields?.layers?.length ?? 0,
    cachedProgresses: morphRuntimeCachedFieldProgressesV0(document, options.cacheState ?? 'hover'),
  }
}

export function latestRuntimeArtifactDateV0(document: MorphRuntimeDocumentV0) {
  let latestTime = Date.parse(document.exportedAt)

  for (const artifact of document.generated ?? []) {
    if (!artifact.createdAt) continue
    const time = Date.parse(artifact.createdAt)
    if (!Number.isNaN(time) && (Number.isNaN(latestTime) || time > latestTime)) {
      latestTime = time
    }
  }

  return Number.isNaN(latestTime) ? document.exportedAt : new Date(latestTime).toISOString()
}
