import type { DrawableLayer, DrawableScene, DrawableStateDefinition, FillShaderConfig, InnerShaderConfig } from './types'
import { createContourField, resolveAutoBalancedShades, serializeContourField, shadeFieldSide } from './field-engine'
import { createDrawableLayerStaticRenderGeometry } from './render'
import { analyzeDrawableSceneMotion } from './motion-resolver'
import { resolveDrawableShadePassPipelineV0 } from './shade-pipeline'
import {
  MORPH_RUNTIME_FIELD_CACHE_POLICY_V0,
  MORPH_RUNTIME_SCHEMA_V0,
  MORPH_RUNTIME_VERSION_V0,
  createMorphRuntimePlaybackMetadataV0,
  createMorphRuntimeDocumentV0,
  type MorphRuntimeCacheV0,
  type MorphRuntimeCapabilitiesV0,
  type MorphRuntimeControllerV0,
  type MorphRuntimeDocumentV0,
  type MorphRuntimeFallbacksV0,
  type MorphRuntimeFieldCacheV0,
  type MorphRuntimeGeneratedArtifactV0,
  type MorphRuntimeManifestV0,
  type MorphRuntimeQualityHintV0,
  type MorphRuntimeRenderTierV0,
  type MorphRuntimeSettingsV0,
  type MorphRuntimeSourceV0,
  validateMorphRuntimeDocumentV0,
} from './runtime-contract'

type FieldCacheVariant = {
  state: string | null
  progress: number
}

export type MorphRuntimeCompileOptionsV0 = {
  exportedAt?: string
  source?: MorphRuntimeSourceV0
  manifest?: MorphRuntimeManifestV0
  capabilities?: MorphRuntimeCapabilitiesV0
  renderTier?: MorphRuntimeRenderTierV0
  quality?: MorphRuntimeQualityHintV0
  fallbacks?: MorphRuntimeFallbacksV0
  settings?: MorphRuntimeSettingsV0
  controllers?: MorphRuntimeControllerV0[]
  generated?: MorphRuntimeGeneratedArtifactV0[]
  keepSource?: boolean
  keepLayerNames?: boolean
  keepSceneMeta?: boolean
  keepStateMetadata?: boolean
  pruneRuntimeDefaults?: boolean
  includeFieldCache?: boolean
  fieldCacheProgressSamples?: number[]
}

export type MorphRuntimeCompileStatsV0 = {
  sourceBytes: number
  compiledBytes: number
  savedBytes: number
  savedRatio: number
  layers: number
  points: number
  stateGeometries: number
  strippedSourceFields: number
  strippedLayerNames: number
  strippedSceneMetaKeys: number
  strippedStateFields: number
  prunedPassFlags: number
  prunedDefaultValues: number
  motionWarnings: number
  cachedFieldLayers: number
  cachedFieldSegments: number
}

export type MorphRuntimeCompileResultV0 = {
  document: MorphRuntimeDocumentV0
  json: string
  stats: MorphRuntimeCompileStatsV0
  problems: string[]
  warnings: string[]
}

type CompileStatsDraft = Omit<MorphRuntimeCompileStatsV0, 'sourceBytes' | 'compiledBytes' | 'savedBytes' | 'savedRatio' | 'layers' | 'points' | 'stateGeometries'>
type MorphRuntimeCompileBehaviorOptionsV0 = Pick<
  MorphRuntimeCompileOptionsV0,
  | 'keepSource'
  | 'keepLayerNames'
  | 'keepSceneMeta'
  | 'keepStateMetadata'
  | 'pruneRuntimeDefaults'
  | 'includeFieldCache'
  | 'fieldCacheProgressSamples'
>

const DEFAULT_COMPILE_OPTIONS: Required<MorphRuntimeCompileBehaviorOptionsV0> = {
  keepSource: false,
  keepLayerNames: false,
  keepSceneMeta: false,
  keepStateMetadata: false,
  pruneRuntimeDefaults: true,
  includeFieldCache: false,
  fieldCacheProgressSamples: [],
}

export function compileMorphRuntimeDocumentV0(input: MorphRuntimeDocumentV0 | DrawableScene, options: MorphRuntimeCompileOptionsV0 = {}): MorphRuntimeCompileResultV0 {
  const resolved = { ...DEFAULT_COMPILE_OPTIONS, ...options }
  const sourceDocument = runtimeDocumentForInput(input, options)
  const inferredMetadata = createMorphRuntimePlaybackMetadataV0(sourceDocument.scene, {
    includeFieldCache: resolved.includeFieldCache,
  })
  const sourceBytes = byteSize(sourceDocument)
  const document = createMorphRuntimeDocumentV0(sourceDocument.scene, {
    exportedAt: options.exportedAt ?? sourceDocument.exportedAt,
    source: options.source ?? sourceDocument.source,
    manifest: options.manifest ?? sourceDocument.manifest,
    capabilities: options.capabilities ?? mergeRuntimeCapabilities(sourceDocument.capabilities, inferredMetadata.capabilities),
    renderTier: options.renderTier ?? sourceDocument.renderTier ?? inferredMetadata.renderTier,
    quality: options.quality ?? sourceDocument.quality ?? inferredMetadata.quality,
    fallbacks: options.fallbacks ?? sourceDocument.fallbacks ?? inferredMetadata.fallbacks,
    settings: options.settings ?? sourceDocument.settings,
    controllers: options.controllers ?? sourceDocument.controllers ?? inferredMetadata.controllers,
    generated: options.generated ?? sourceDocument.generated,
  })
  const draft: CompileStatsDraft = {
    strippedSourceFields: 0,
    strippedLayerNames: 0,
    strippedSceneMetaKeys: 0,
    strippedStateFields: 0,
    prunedPassFlags: 0,
    prunedDefaultValues: 0,
    motionWarnings: 0,
    cachedFieldLayers: 0,
    cachedFieldSegments: 0,
  }
  const warnings = analyzeDrawableSceneMotion(document.scene).map((warning) =>
    `Motion ${warning.kind} warning on ${warning.layerId}.${warning.stateId}: ${warning.message}`
  )
  draft.motionWarnings = warnings.length

  if (!resolved.keepSource && document.source) {
    draft.strippedSourceFields += Object.keys(document.source).length
    delete document.source
  }

  compileScene(document.scene, resolved, draft)
  document.generated = upsertGeneratedArtifact(document.generated, {
    id: 'runtime-compile',
    kind: 'baked',
    owner: 'morph-runtime-compiler',
    target: 'document',
    clearable: false,
    baked: true,
    createdAt: document.exportedAt,
  })
  if (resolved.includeFieldCache) {
    const fields = compileFieldCache(document.scene, resolved.fieldCacheProgressSamples)
    document.cache = {
      ...(document.cache ?? {}),
      fields,
    }
    document.generated = upsertGeneratedArtifact(document.generated, {
      id: 'field-cache',
      kind: 'cache',
      owner: 'morph-runtime-compiler',
      target: 'cache.fields',
      clearable: true,
      baked: true,
      createdAt: document.exportedAt,
    })
    draft.cachedFieldLayers = fields.layers.length
    draft.cachedFieldSegments = fields.layers.reduce((sum, layer) => sum + layer.contourSegments, 0)
  }

  const json = serializeMorphRuntimeDocumentV0(document)
  const compiledBytes = byteSize(json)
  const sourceMetric = sceneMetrics(sourceDocument.scene)
  return {
    document,
    json,
    problems: validateMorphRuntimeDocumentV0(document),
    warnings,
    stats: {
      ...draft,
      sourceBytes,
      compiledBytes,
      savedBytes: Math.max(0, sourceBytes - compiledBytes),
      savedRatio: sourceBytes > 0 ? Math.max(0, (sourceBytes - compiledBytes) / sourceBytes) : 0,
      layers: sourceMetric.layers,
      points: sourceMetric.points,
      stateGeometries: sourceMetric.stateGeometries,
    },
  }
}

export function serializeMorphRuntimeDocumentV0(document: MorphRuntimeDocumentV0): string {
  return JSON.stringify(document)
}

function runtimeDocumentForInput(input: MorphRuntimeDocumentV0 | DrawableScene, options: MorphRuntimeCompileOptionsV0): MorphRuntimeDocumentV0 {
  if (isRuntimeDocumentLike(input)) return input
  return createMorphRuntimeDocumentV0(input, {
    exportedAt: options.exportedAt,
    source: options.source,
  })
}

export function createMorphRuntimeFieldCacheV0(scene: DrawableScene, progressSamples: number[] = []): MorphRuntimeCacheV0 {
  return { fields: compileFieldCache(scene, progressSamples) }
}

function upsertGeneratedArtifact(
  generated: MorphRuntimeGeneratedArtifactV0[] | undefined,
  artifact: MorphRuntimeGeneratedArtifactV0,
): MorphRuntimeGeneratedArtifactV0[] {
  const next = (generated ?? []).filter((item) => item.id !== artifact.id)
  next.push(artifact)
  return next
}

function mergeRuntimeCapabilities(
  source: MorphRuntimeCapabilitiesV0 | undefined,
  inferred: MorphRuntimeCapabilitiesV0 | undefined,
): MorphRuntimeCapabilitiesV0 | undefined {
  if (!source) return inferred
  if (!inferred) return source

  const required = unique([
    ...(source.required ?? []),
    ...(inferred.required ?? []),
  ])
  const optional = unique([
    ...(source.optional ?? []),
    ...(inferred.optional ?? []),
  ]).filter((capability) => !required.includes(capability))

  return {
    ...(required.length ? { required } : {}),
    ...(optional.length ? { optional } : {}),
  }
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)]
}

function compileFieldCache(scene: DrawableScene, progressSamples: number[]): MorphRuntimeFieldCacheV0 {
  return {
    kind: 'field-cache',
    version: 0,
    policy: MORPH_RUNTIME_FIELD_CACHE_POLICY_V0,
    layers: scene.layers.flatMap((layer, index) => {
      if (layer.geometry.kind !== 'closed') return []
      return fieldCacheVariants(layer, progressSamples).map((variant) => {
        const renderGeometry = createDrawableLayerStaticRenderGeometry(layer, index, {
          state: variant.state ?? undefined,
          progress: variant.progress,
          frame: 0,
        })
        const field = createContourField(renderGeometry.core)
        const shadePipeline = resolveDrawableShadePassPipelineV0(
          layer.inner,
          layer.passes,
          layer.inner ? resolveAutoBalancedShades(layer.inner) : undefined,
        )
        const sides = new Set<'inside' | 'outside' | 'both'>()
        for (const shade of shadePipeline) sides.add(shadeFieldSide(shade.pass))
        return {
          layerId: layer.id,
          renderKey: renderGeometry.key,
          state: variant.state,
          progress: variant.progress,
          geometryKind: 'closed' as const,
          seed: renderGeometry.seed,
          points: renderGeometry.core.length,
          contourSegments: field.segments.length,
          contourLength: cacheNumber(field.length),
          bounds: renderBounds(renderGeometry.bounds),
          passes: shadePipeline.map((shade) => shade.id),
          sides: [...sides],
          contour: serializeContourField(field),
        }
      })
    }),
  }
}

function fieldCacheVariants(layer: DrawableLayer, progressSamples: number[]): FieldCacheVariant[] {
  const variants: FieldCacheVariant[] = [{ state: null, progress: 0 }]
  for (const [state, geometry] of Object.entries(layer.states ?? {})) {
    if (geometry.kind === 'closed' && geometry.points.length >= 3) {
      for (const progress of normalizedProgressSamples(progressSamples)) {
        variants.push({ state, progress })
      }
      variants.push({ state, progress: 1 })
    }
  }
  return uniqueFieldCacheVariants(variants)
}

function normalizedProgressSamples(samples: number[]) {
  return samples
    .filter((sample) => Number.isFinite(sample) && sample > 0 && sample < 1)
    .map((sample) => Number(Math.max(0, Math.min(1, sample)).toFixed(4)))
    .sort((a, b) => a - b)
}

function uniqueFieldCacheVariants(variants: FieldCacheVariant[]) {
  const seen = new Set<string>()
  return variants.filter((variant) => {
    const key = `${variant.state ?? ''}|${variant.progress.toFixed(4)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function renderBounds(bounds: { minX: number; minY: number; maxX: number; maxY: number }): [number, number, number, number] {
  return [cacheNumber(bounds.minX), cacheNumber(bounds.minY), cacheNumber(bounds.maxX), cacheNumber(bounds.maxY)]
}

function cacheNumber(value: number) {
  return Number(value.toFixed(3))
}

function compileScene(scene: DrawableScene, options: Required<MorphRuntimeCompileBehaviorOptionsV0>, stats: CompileStatsDraft) {
  if (!options.keepSceneMeta && scene.meta) {
    const authoringBlank = scene.meta.authoringBlank === true
    stats.strippedSceneMetaKeys += Object.keys(scene.meta).length - (authoringBlank ? 1 : 0)
    scene.meta = authoringBlank ? { authoringBlank: true } : undefined
  }
  if (!options.keepStateMetadata && scene.states) scene.states = compileStates(scene.states, stats)
  scene.layers = scene.layers.map((layer) => compileLayer(layer, options, stats))
}

function compileLayer(layer: DrawableLayer, options: Required<MorphRuntimeCompileBehaviorOptionsV0>, stats: CompileStatsDraft): DrawableLayer {
  if (!options.keepLayerNames && layer.name) {
    stats.strippedLayerNames++
    delete layer.name
  }
  if (options.pruneRuntimeDefaults) {
    layer.passes = compilePasses(layer.passes, stats)
    layer.fill = compileFill(layer.fill, stats)
    layer.inner = compileInner(layer.inner, stats)
  }
  return layer
}

function compileStates(states: Record<string, DrawableStateDefinition>, stats: CompileStatsDraft): Record<string, DrawableStateDefinition> {
  return Object.fromEntries(Object.entries(states).map(([id, definition]) => {
    stats.strippedStateFields += Object.keys(definition).length
    return [id, {}]
  }))
}

function compilePasses(layerPasses: DrawableLayer['passes'], stats: CompileStatsDraft): DrawableLayer['passes'] {
  if (!layerPasses) return undefined
  const kept = Object.fromEntries(Object.entries(layerPasses).filter(([, value]) => {
    if (value === true) {
      stats.prunedPassFlags++
      return false
    }
    return value === false
  })) as DrawableLayer['passes']
  return kept && Object.keys(kept).length ? kept : undefined
}

function compileFill(fill: FillShaderConfig | undefined, stats: CompileStatsDraft): FillShaderConfig | undefined {
  if (!fill) return undefined
  if (fill.opacity === 1) {
    delete fill.opacity
    stats.prunedDefaultValues++
  }
  if (fill.hatching == null && 'hatching' in fill) {
    delete fill.hatching
    stats.prunedDefaultValues++
  }
  return fill
}

function compileInner(inner: InnerShaderConfig | undefined, stats: CompileStatsDraft): InnerShaderConfig | undefined {
  if (!inner) return undefined
  if (inner.innerShadow == null && 'innerShadow' in inner) {
    delete inner.innerShadow
    stats.prunedDefaultValues++
  }
  if (inner.highlight == null && 'highlight' in inner) {
    delete inner.highlight
    stats.prunedDefaultValues++
  }
  if (Array.isArray(inner.shadePasses) && inner.shadePasses.length === 0) {
    delete inner.shadePasses
    stats.prunedDefaultValues++
  }
  if (inner.shadeBands == null && 'shadeBands' in inner) {
    delete inner.shadeBands
    stats.prunedDefaultValues++
  }
  if (inner.autoBalance == null && 'autoBalance' in inner) {
    delete inner.autoBalance
    stats.prunedDefaultValues++
  }
  return Object.keys(inner).length ? inner : undefined
}

function sceneMetrics(scene: DrawableScene) {
  let points = 0
  let stateGeometries = 0
  for (const layer of scene.layers) {
    points += geometryPointCount(layer.geometry)
    for (const state of Object.values(layer.states ?? {})) {
      stateGeometries++
      points += geometryPointCount(state)
    }
  }
  return { layers: scene.layers.length, points, stateGeometries }
}

function geometryPointCount(geometry: DrawableLayer['geometry']) {
  if (geometry.kind === 'closed' || geometry.kind === 'open') return geometry.points.length
  if (geometry.kind === 'multi') return geometry.groups.reduce((sum, group) => sum + group.length, 0)
  return geometry.strokes.reduce((sum, stroke) => sum + stroke.length, 0)
}

function byteSize(value: unknown) {
  return new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).length
}

function isRuntimeDocumentLike(value: unknown): value is MorphRuntimeDocumentV0 {
  return typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    (value as MorphRuntimeDocumentV0).schema === MORPH_RUNTIME_SCHEMA_V0 &&
    (value as MorphRuntimeDocumentV0).version === MORPH_RUNTIME_VERSION_V0 &&
    typeof (value as MorphRuntimeDocumentV0).scene === 'object'
}
