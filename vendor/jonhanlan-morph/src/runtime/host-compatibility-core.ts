import type { MorphRuntimeControllerV0, MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'
import {
  MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0,
  MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0,
  hostInputForController,
  geometrySummaryForDocument,
  runtimeRequiresStateEnginePlayerV0,
  shadePipelineForDocument,
  type MorphRuntimeHostCompatibilitySummaryV0,
  type MorphRuntimeHostGeometryV0,
  type MorphRuntimeHostInputV0,
  type MorphRuntimeHostShadePipelinePassV0,
  type MorphRuntimeHostShadePipelineV0,
} from './host-compatibility-summary'

export {
  MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0,
  MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0,
  createMorphRuntimeHostCompatibilitySummaryForDocumentV0,
  runtimeRequiresStateEnginePlayerV0,
  type MorphRuntimeHostCompatibilitySummaryV0,
  type MorphRuntimeHostGeometryV0,
  type MorphRuntimeHostInputV0,
  type MorphRuntimeHostShadePipelinePassV0,
  type MorphRuntimeHostShadePipelineV0,
} from './host-compatibility-summary'

export type MorphRuntimeHostAdapterV0 =
  | {
      kind: 'scroll-progress'
      source: 'section' | 'page' | 'element'
      controllerId: string
      startId?: string
      endId?: string
    }
  | {
      kind: 'viewport-trigger'
      trigger: 'in-view' | 'scroll-past'
      controllerId: string
      rootMargin?: string
      thresholdPx?: number
    }
  | {
      kind: 'scroll-progress-with-pointer-overlays'
      source: 'section'
      controllerId: string
      startId: string
      endId: string
      overlays: readonly ('hover' | 'click')[]
    }

export type MorphRuntimeHostMediaAssetV0 =
  | {
      kind: 'image-fill'
      layerId: string
      href: string
      width?: number
      height?: number
      preserveAspectRatio?: string
    }
  | {
      kind: 'static-fallback'
      href: string
      fallbackKind: string
      width?: number
      height?: number
    }

export type MorphRuntimeHostFieldCacheV0 = {
  kind: 'field-cache'
  policy?: string
  layers: number
  layerIds: string[]
  cachedProgresses: number[]
  passes: string[]
  sides: string[]
}

export type MorphRuntimeHostCompatibilityReportV0 = {
  schema: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0
  version: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0
  storageKey: string
  artifactPath: string
  sceneId: string
  sceneKind: string
  title?: string
  byteLength: number
  renderTier?: string
  quality?: string
  requiredCapabilities: string[]
  optionalCapabilities: string[]
  controllers: MorphRuntimeControllerV0[]
  hostAdapter?: MorphRuntimeHostAdapterV0
  hostInputs: MorphRuntimeHostInputV0[]
  geometry: MorphRuntimeHostGeometryV0
  mediaAssets: MorphRuntimeHostMediaAssetV0[]
  fieldCache?: MorphRuntimeHostFieldCacheV0
  shadePipeline?: MorphRuntimeHostShadePipelineV0
  player: {
    packageEntry: '@jonhanlan/morph/react/MorphRuntimePlayer' | '@jonhanlan/morph/react/MorphRuntimeStateEnginePlayer'
    stateEngine: boolean
    reducedMotionFallback?: string
    staticFallback: boolean
  }
}

export type MorphRuntimeHostCompatibilitySourceV0 = {
  storageKey: string
  artifactPath?: string
  sceneId?: string
  sceneKind?: string
  title?: string
  byteLength?: number
  renderTier?: string
  quality?: string
  requiredCapabilities?: string[]
  optionalCapabilities?: string[]
  reducedMotionFallback?: string
  hostAdapter?: MorphRuntimeHostAdapterV0
}

export function createMorphRuntimeHostCompatibilityReportForDocumentV0(
  document: MorphRuntimeDocumentV0,
  source: MorphRuntimeHostCompatibilitySourceV0,
): MorphRuntimeHostCompatibilityReportV0 {
  const controllers = document.controllers ?? []
  const mediaAssets = mediaAssetsForDocument(document)
  const stateEngine = runtimeRequiresStateEnginePlayerV0(document)
  const geometry = geometrySummaryForDocument(document)
  const fieldCache = fieldCacheForDocument(document)
  const shadePipeline = shadePipelineForDocument(document)

  return {
    schema: MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0,
    version: MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0,
    storageKey: source.storageKey,
    artifactPath: source.artifactPath ?? `runtime/${source.storageKey}.json`,
    sceneId: source.sceneId ?? document.scene.id,
    sceneKind: source.sceneKind ?? document.scene.kind,
    title: source.title ?? document.manifest?.title,
    byteLength: source.byteLength ?? new TextEncoder().encode(JSON.stringify(document)).length,
    renderTier: source.renderTier ?? document.renderTier,
    quality: source.quality ?? document.quality,
    requiredCapabilities: source.requiredCapabilities ?? document.capabilities?.required ?? [],
    optionalCapabilities: source.optionalCapabilities ?? document.capabilities?.optional ?? [],
    controllers,
    ...(source.hostAdapter ? { hostAdapter: source.hostAdapter } : {}),
    hostInputs: source.hostAdapter
      ? hostInputsForAdapter(source.hostAdapter)
      : controllers.map(hostInputForController),
    geometry,
    mediaAssets,
    ...(fieldCache ? { fieldCache } : {}),
    ...(shadePipeline ? { shadePipeline } : {}),
    player: {
      packageEntry: stateEngine
        ? '@jonhanlan/morph/react/MorphRuntimeStateEnginePlayer'
        : '@jonhanlan/morph/react/MorphRuntimePlayer',
      stateEngine,
      reducedMotionFallback: source.reducedMotionFallback ?? document.fallbacks?.reducedMotion,
      staticFallback: !!document.fallbacks?.static,
    },
  }
}

function fieldCacheForDocument(document: MorphRuntimeDocumentV0): MorphRuntimeHostFieldCacheV0 | null {
  const fields = document.cache?.fields
  if (!fields) return null
  const layers = fields.layers ?? []
  return {
    kind: 'field-cache',
    policy: fields.policy,
    layers: layers.length,
    layerIds: uniqueSorted(layers.map((layer) => layer.layerId)),
    cachedProgresses: uniqueNumbers(layers.map((layer) => layer.progress)),
    passes: uniqueSorted(layers.flatMap((layer) => layer.passes ?? [])),
    sides: uniqueSorted(layers.flatMap((layer) => layer.sides ?? [])),
  }
}

function mediaAssetsForDocument(document: MorphRuntimeDocumentV0): MorphRuntimeHostMediaAssetV0[] {
  const assets: MorphRuntimeHostMediaAssetV0[] = []
  for (const layer of document.scene.layers) {
    const image = layer.fill?.image
    if (image?.href && isExternalHostAssetHref(image.href)) {
      assets.push({
        kind: 'image-fill',
        layerId: layer.id,
        href: image.href,
        ...(image.width !== undefined ? { width: image.width } : {}),
        ...(image.height !== undefined ? { height: image.height } : {}),
        ...(image.preserveAspectRatio ? { preserveAspectRatio: image.preserveAspectRatio } : {}),
      })
    }
  }

  const staticFallback = document.fallbacks?.static
  if (staticFallback?.href && isExternalHostAssetHref(staticFallback.href)) {
    assets.push({
      kind: 'static-fallback',
      href: staticFallback.href,
      fallbackKind: staticFallback.kind,
      ...(staticFallback.width !== undefined ? { width: staticFallback.width } : {}),
      ...(staticFallback.height !== undefined ? { height: staticFallback.height } : {}),
    })
  }

  return assets
}

function isExternalHostAssetHref(href: string): boolean {
  return !href.startsWith('data:') && !href.startsWith('#')
}

function hostInputsForAdapter(adapter: MorphRuntimeHostAdapterV0): MorphRuntimeHostInputV0[] {
  if (adapter.kind === 'scroll-progress') {
    return [{
      kind: 'scroll-progress',
      controllerId: adapter.controllerId,
      source: adapter.source,
      ...(adapter.startId ? { startId: adapter.startId } : {}),
      ...(adapter.endId ? { endId: adapter.endId } : {}),
    }]
  }

  if (adapter.kind === 'viewport-trigger') {
    return [{
      kind: 'viewport-trigger',
      controllerId: adapter.controllerId,
      trigger: adapter.trigger,
      ...(adapter.rootMargin ? { rootMargin: adapter.rootMargin } : {}),
      ...(adapter.thresholdPx !== undefined ? { thresholdPx: adapter.thresholdPx } : {}),
    }]
  }

  return [
    {
      kind: 'scroll-progress',
      controllerId: adapter.controllerId,
      source: adapter.source,
      startId: adapter.startId,
      endId: adapter.endId,
    },
    {
      kind: 'pointer-overlays',
      overlays: adapter.overlays,
    },
  ]
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}

function uniqueNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}
