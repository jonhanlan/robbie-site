import type { DrawableLayer, DrawablePoint, DrawableScene, GeometryPrimitive, StrokePoint } from './types'
import type { SerializedContourField } from './field-engine'

export const MORPH_RUNTIME_SCHEMA_V0 = 'morph-runtime/v0'
export const MORPH_RUNTIME_VERSION_V0 = 0
export const MORPH_RUNTIME_SCHEMA_V1 = 'morph-runtime/v1'
export const MORPH_RUNTIME_VERSION_V1 = 1
export const MORPH_RUNTIME_SCHEMA_V2 = 'morph-runtime/v2'
export const MORPH_RUNTIME_VERSION_V2 = 2

export type MorphRuntimeSchemaV0 = typeof MORPH_RUNTIME_SCHEMA_V0
export type MorphRuntimeVersionV0 = typeof MORPH_RUNTIME_VERSION_V0
export type MorphRuntimeSchemaV1 = typeof MORPH_RUNTIME_SCHEMA_V1
export type MorphRuntimeVersionV1 = typeof MORPH_RUNTIME_VERSION_V1
export type MorphRuntimeSchemaV2 = typeof MORPH_RUNTIME_SCHEMA_V2
export type MorphRuntimeVersionV2 = typeof MORPH_RUNTIME_VERSION_V2
const INTERRUPT_MODES = new Set(['restart', 'continue', 'queue', 'ignore'])
const FPS_DIVISORS = new Set([1, 2, 4])
const TIMING_NUMBER_FIELDS = ['durationMs', 'delayMs', 'holdMs', 'returnDelayMs', 'returnDurationMs'] as const
export const MORPH_RUNTIME_RENDER_TIERS_V0 = ['svg', 'svg-cache', 'canvas', 'webgl', 'webgpu', 'native'] as const
export const MORPH_RUNTIME_QUALITY_HINTS_V0 = ['high', 'medium', 'low', 'static'] as const
export const MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0 = ['static', 'first-frame', 'freeze', 'none'] as const
export const MORPH_RUNTIME_CAPABILITIES_V0 = [
  'svg',
  'svg-cache',
  'state-motion',
  'pointer-hover',
  'pointer-press',
  'focus',
  'scroll-scrub',
  'additive-overlays',
  'field-cache',
  'procedural-marks',
  'image-fill',
  'reduced-motion',
  'static-fallback',
] as const
export const MORPH_RUNTIME_FIELD_CACHE_POLICIES_V0 = ['exact'] as const
export const MORPH_RUNTIME_FIELD_CACHE_POLICY_V0 = 'exact' as const

const RENDER_TIERS = new Set<string>(MORPH_RUNTIME_RENDER_TIERS_V0)
const QUALITY_HINTS = new Set<string>(MORPH_RUNTIME_QUALITY_HINTS_V0)
const REDUCED_MOTION_FALLBACKS = new Set<string>(MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0)
const CAPABILITIES = new Set<string>(MORPH_RUNTIME_CAPABILITIES_V0)
const FIELD_CACHE_POLICIES = new Set<string>(MORPH_RUNTIME_FIELD_CACHE_POLICIES_V0)

export type MorphRuntimeSourceV0 = {
  app?: string
  documentKind?: DrawableScene['kind'] | string
  storageKey?: string
  draftKey?: string
}

export type MorphRuntimeRenderTierV0 = typeof MORPH_RUNTIME_RENDER_TIERS_V0[number]
export type MorphRuntimeQualityHintV0 = typeof MORPH_RUNTIME_QUALITY_HINTS_V0[number]
export type MorphRuntimeReducedMotionFallbackV0 = typeof MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0[number]
export type MorphRuntimeBoilModeV0 = 'always' | 'active-only' | 'off'
export type MorphRuntimeCapabilityV0 = typeof MORPH_RUNTIME_CAPABILITIES_V0[number]
export type MorphRuntimeFieldCachePolicyV0 = typeof MORPH_RUNTIME_FIELD_CACHE_POLICIES_V0[number]

export type MorphRuntimeCapabilitiesV0 = {
  required?: MorphRuntimeCapabilityV0[]
  optional?: MorphRuntimeCapabilityV0[]
}

export type MorphRuntimeStaticFallbackV0 = {
  kind: 'svg' | 'png' | 'webp'
  href?: string
  data?: string
  width?: number
  height?: number
}

export type MorphRuntimeFallbacksV0 = {
  static?: MorphRuntimeStaticFallbackV0
  reducedMotion?: MorphRuntimeReducedMotionFallbackV0
  quality?: Partial<Record<MorphRuntimeQualityHintV0, MorphRuntimeStaticFallbackV0>>
}

export type MorphRuntimeSettingsV0 = {
  boil?: MorphRuntimeBoilModeV0
}

export type MorphRuntimeControllerV0 = {
  id: string
  type: 'boolean' | 'number' | 'trigger' | 'slider' | 'joystick' | 'switch' | string
  label?: string
  channel?: string
  default?: boolean | number | string | { x: number; y: number }
  min?: number
  max?: number
  options?: string[]
}

export type MorphRuntimeGeneratedArtifactV0 = {
  id: string
  kind: 'preview' | 'cache' | 'fallback' | 'baked' | 'user-owned' | string
  owner: string
  target?: string
  sourceState?: string
  targetState?: string
  clearable?: boolean
  baked?: boolean
  createdAt?: string
}

export type MorphRuntimeManifestV0 = {
  title?: string
  description?: string
  author?: string
  tags?: string[]
}

export type MorphRuntimeFieldCacheLayerV0 = {
  layerId: string
  renderKey: string
  state: string | null
  progress: number
  geometryKind: 'closed'
  seed: number
  points: number
  contourSegments: number
  contourLength: number
  bounds: [number, number, number, number]
  passes: string[]
  sides: Array<'inside' | 'outside' | 'both'>
  contour: SerializedContourField
}

export type MorphRuntimeFieldCacheV0 = {
  kind: 'field-cache'
  version: 0
  policy?: MorphRuntimeFieldCachePolicyV0
  layers: MorphRuntimeFieldCacheLayerV0[]
}

export type MorphRuntimeCacheV0 = {
  fields?: MorphRuntimeFieldCacheV0
}

/**
 * Morph Runtime Contract v0.
 *
 * This is the public-site payload envelope. The editor may keep larger local
 * draft data, but anything the site player consumes should be wrapped here so
 * future schema changes are explicit and migratable.
 */
export type MorphRuntimeDocumentV0 = {
  schema: MorphRuntimeSchemaV0
  version: MorphRuntimeVersionV0
  exportedAt: string
  source?: MorphRuntimeSourceV0
  manifest?: MorphRuntimeManifestV0
  capabilities?: MorphRuntimeCapabilitiesV0
  renderTier?: MorphRuntimeRenderTierV0
  quality?: MorphRuntimeQualityHintV0
  fallbacks?: MorphRuntimeFallbacksV0
  settings?: MorphRuntimeSettingsV0
  controllers?: MorphRuntimeControllerV0[]
  generated?: MorphRuntimeGeneratedArtifactV0[]
  cache?: MorphRuntimeCacheV0
  scene: DrawableScene
}

export type MorphRuntimeMigrationV1 = {
  fromSchema?: MorphRuntimeSchemaV0
  reason?: 'ribbon-geometry' | 'compound-geometry' | 'stroke-model' | string
  preservesV0Playback?: boolean
}

export type MorphRuntimeDocumentV1 = Omit<MorphRuntimeDocumentV0, 'schema' | 'version'> & {
  schema: MorphRuntimeSchemaV1
  version: MorphRuntimeVersionV1
  migration?: MorphRuntimeMigrationV1
}

export type MorphRuntimeTimelineEasingV2 = 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'smoothstep' | 'hold'

export type MorphRuntimeTimelineKeyframeV2 = {
  timeMs: number
  value: number
  easing?: MorphRuntimeTimelineEasingV2
}

export type MorphRuntimeTimelineStateProgressTargetV2 = {
  kind: 'state-progress'
  fromState: string
  toState: string
}

export type MorphRuntimeTimelineLayerTransformPropertyV2 = 'translateX' | 'translateY' | 'rotationDeg'

export type MorphRuntimeTimelineLayerTransformTargetV2 = {
  kind: 'layer-transform'
  layerId: string
  property: MorphRuntimeTimelineLayerTransformPropertyV2
}

export type MorphRuntimeTimelineTrackV2 = {
  id: string
  label?: string
  target: MorphRuntimeTimelineStateProgressTargetV2
  keyframes: MorphRuntimeTimelineKeyframeV2[]
}

export type MorphRuntimeTimelineLayerTransformTrackV2 = {
  id: string
  label?: string
  target: MorphRuntimeTimelineLayerTransformTargetV2
  keyframes: MorphRuntimeTimelineKeyframeV2[]
}

export type MorphRuntimeTimelineAnyTrackV2 = MorphRuntimeTimelineTrackV2 | MorphRuntimeTimelineLayerTransformTrackV2

export type MorphRuntimeTimelineV2 = {
  id: string
  label?: string
  durationMs: number
  loop?: boolean
  /** Validation keeps the state-progress lane first so existing v2 consumers retain their behavior. */
  tracks: MorphRuntimeTimelineAnyTrackV2[]
}

export type MorphRuntimeMigrationV2 = {
  fromSchema: MorphRuntimeSchemaV0 | MorphRuntimeSchemaV1
  reason: 'timeline-keyframes'
  preservesPriorPlayback: true
}

export type MorphRuntimeDocumentV2 = Omit<MorphRuntimeDocumentV0, 'schema' | 'version'> & {
  schema: MorphRuntimeSchemaV2
  version: MorphRuntimeVersionV2
  migration: MorphRuntimeMigrationV2
  timeline: MorphRuntimeTimelineV2
}

export type MorphRuntimeDocument = MorphRuntimeDocumentV0 | MorphRuntimeDocumentV1 | MorphRuntimeDocumentV2

export type MorphRuntimeDocumentOptionsV0 = {
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
  cache?: MorphRuntimeCacheV0
}

export type MorphRuntimeDocumentOptionsV1 = MorphRuntimeDocumentOptionsV0 & {
  migration?: MorphRuntimeMigrationV1
}

export type MorphRuntimeDocumentOptionsV2 = MorphRuntimeDocumentOptionsV0 & {
  migration: MorphRuntimeMigrationV2
  timeline: MorphRuntimeTimelineV2
}

export type MorphRuntimePlaybackMetadataOptionsV0 = {
  includeFieldCache?: boolean
  renderTier?: MorphRuntimeRenderTierV0
  quality?: MorphRuntimeQualityHintV0
  reducedMotionFallback?: MorphRuntimeReducedMotionFallbackV0
  requiredCapabilities?: MorphRuntimeCapabilityV0[]
  optionalCapabilities?: MorphRuntimeCapabilityV0[]
  controllers?: MorphRuntimeControllerV0[]
}

export type MorphRuntimePlaybackMetadataV0 = Pick<
  MorphRuntimeDocumentOptionsV0,
  'capabilities' | 'renderTier' | 'quality' | 'fallbacks' | 'controllers'
>

export function createMorphRuntimePlaybackMetadataV0(
  scene: DrawableScene,
  options: MorphRuntimePlaybackMetadataOptionsV0 = {},
): MorphRuntimePlaybackMetadataV0 {
  const renderTier = options.renderTier ?? (options.includeFieldCache ? 'svg-cache' : 'svg')
  const required = uniqueCapabilities([
    'svg',
    ...(sceneUsesStateMotion(scene) ? ['state-motion' as const] : []),
    ...(options.requiredCapabilities ?? []),
  ])
  const optional = uniqueCapabilities([
    ...(renderTier === 'svg-cache' ? ['svg-cache' as const] : []),
    ...(sceneUsesScrollScrub(scene) ? ['scroll-scrub' as const] : []),
    ...(sceneUsesAdditiveOverlays(scene) ? ['additive-overlays' as const] : []),
    ...(sceneUsesProceduralMarks(scene) ? ['procedural-marks' as const] : []),
    ...(sceneUsesImageFill(scene) ? ['image-fill' as const] : []),
    ...(options.includeFieldCache ? ['field-cache' as const] : []),
    ...(options.reducedMotionFallback ? ['reduced-motion' as const] : []),
    ...(options.optionalCapabilities ?? []),
  ]).filter((capability) => !required.includes(capability))
  const controllers = options.controllers ?? inferRuntimeControllersV0(scene)

  return {
    capabilities: {
      required,
      ...(optional.length ? { optional } : {}),
    },
    renderTier,
    quality: options.quality ?? (sceneUsesProceduralMarks(scene) || sceneUsesStateMotion(scene) ? 'high' : 'static'),
    fallbacks: {
      reducedMotion: options.reducedMotionFallback ?? (sceneUsesStateMotion(scene) ? 'first-frame' : 'static'),
    },
    ...(controllers.length ? { controllers } : {}),
  }
}

export function createMorphRuntimeDocumentV0(scene: DrawableScene, options: MorphRuntimeDocumentOptionsV0 = {}): MorphRuntimeDocumentV0 {
  return {
    schema: MORPH_RUNTIME_SCHEMA_V0,
    version: MORPH_RUNTIME_VERSION_V0,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    source: options.source,
    ...(options.manifest ? { manifest: clonePlain(options.manifest) } : {}),
    ...(options.capabilities ? { capabilities: clonePlain(options.capabilities) } : {}),
    ...(options.renderTier ? { renderTier: options.renderTier } : {}),
    ...(options.quality ? { quality: options.quality } : {}),
    ...(options.fallbacks ? { fallbacks: clonePlain(options.fallbacks) } : {}),
    ...(options.settings ? { settings: clonePlain(options.settings) } : {}),
    ...(options.controllers ? { controllers: clonePlain(options.controllers) } : {}),
    ...(options.generated ? { generated: clonePlain(options.generated) } : {}),
    ...(options.cache ? { cache: clonePlain(options.cache) } : {}),
    scene: normalizeDrawableSceneForRuntimeV0(scene),
  }
}

export function createMorphRuntimeDocumentV1(scene: DrawableScene, options: MorphRuntimeDocumentOptionsV1 = {}): MorphRuntimeDocumentV1 {
  return {
    schema: MORPH_RUNTIME_SCHEMA_V1,
    version: MORPH_RUNTIME_VERSION_V1,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    source: options.source,
    ...(options.manifest ? { manifest: clonePlain(options.manifest) } : {}),
    ...(options.capabilities ? { capabilities: clonePlain(options.capabilities) } : {}),
    ...(options.renderTier ? { renderTier: options.renderTier } : {}),
    ...(options.quality ? { quality: options.quality } : {}),
    ...(options.fallbacks ? { fallbacks: clonePlain(options.fallbacks) } : {}),
    ...(options.settings ? { settings: clonePlain(options.settings) } : {}),
    ...(options.controllers ? { controllers: clonePlain(options.controllers) } : {}),
    ...(options.generated ? { generated: clonePlain(options.generated) } : {}),
    ...(options.cache ? { cache: clonePlain(options.cache) } : {}),
    ...(options.migration ? { migration: clonePlain(options.migration) } : {}),
    scene: normalizeDrawableSceneForRuntimeV0(scene),
  }
}

export function createMorphRuntimeDocumentV2(scene: DrawableScene, options: MorphRuntimeDocumentOptionsV2): MorphRuntimeDocumentV2 {
  return {
    schema: MORPH_RUNTIME_SCHEMA_V2,
    version: MORPH_RUNTIME_VERSION_V2,
    exportedAt: options.exportedAt ?? new Date().toISOString(),
    source: options.source,
    ...(options.manifest ? { manifest: clonePlain(options.manifest) } : {}),
    ...(options.capabilities ? { capabilities: clonePlain(options.capabilities) } : {}),
    ...(options.renderTier ? { renderTier: options.renderTier } : {}),
    ...(options.quality ? { quality: options.quality } : {}),
    ...(options.fallbacks ? { fallbacks: clonePlain(options.fallbacks) } : {}),
    ...(options.settings ? { settings: clonePlain(options.settings) } : {}),
    ...(options.controllers ? { controllers: clonePlain(options.controllers) } : {}),
    ...(options.generated ? { generated: clonePlain(options.generated) } : {}),
    ...(options.cache ? { cache: clonePlain(options.cache) } : {}),
    migration: clonePlain(options.migration),
    timeline: clonePlain(options.timeline),
    scene: normalizeDrawableSceneForRuntimeV0(scene),
  }
}

export function normalizeDrawableSceneForRuntimeV0(scene: DrawableScene): DrawableScene {
  return {
    id: scene.id,
    kind: scene.kind,
    viewBox: [scene.viewBox[0], scene.viewBox[1]],
    layers: scene.layers.map(normalizeLayer),
    ...(scene.entry ? { entry: scene.entry } : {}),
    ...(scene.states ? { states: clonePlain(scene.states) } : {}),
    ...(scene.transitions ? { transitions: clonePlain(scene.transitions) } : {}),
    ...(scene.stateGraph ? { stateGraph: clonePlain(scene.stateGraph) } : {}),
    ...(scene.scrub ? { scrub: clonePlain(scene.scrub) } : {}),
    ...(scene.composition ? { composition: clonePlain(scene.composition) } : {}),
    ...(scene.proximity ? { proximity: clonePlain(scene.proximity) } : {}),
    ...(scene.returnTarget ? { returnTarget: scene.returnTarget } : {}),
    ...(scene.motion ? { motion: clonePlain(scene.motion) } : {}),
    ...(scene.meta ? { meta: clonePlain(scene.meta) } : {}),
  }
}

export function isMorphRuntimeDocumentV0(value: unknown): value is MorphRuntimeDocumentV0 {
  return validateMorphRuntimeDocumentV0(value).length === 0
}

export function isMorphRuntimeDocumentV1(value: unknown): value is MorphRuntimeDocumentV1 {
  return validateMorphRuntimeDocumentV1(value).length === 0
}

export function isMorphRuntimeDocumentV2(value: unknown): value is MorphRuntimeDocumentV2 {
  return validateMorphRuntimeDocumentV2(value).length === 0
}

export function isCompiledMorphRuntimeDocumentV0(value: unknown): value is MorphRuntimeDocumentV0 {
  if (!isMorphRuntimeDocumentV0(value)) return false
  return (value.generated ?? []).some((artifact) =>
    artifact.id === 'runtime-compile' &&
    artifact.kind === 'baked' &&
    artifact.owner === 'morph-runtime-compiler' &&
    artifact.target === 'document' &&
    artifact.baked === true
  )
}

export function validateMorphRuntimeDocumentV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime document must be an object.']
  if (value.schema !== MORPH_RUNTIME_SCHEMA_V0) problems.push(`Runtime schema must be "${MORPH_RUNTIME_SCHEMA_V0}".`)
  if (value.version !== MORPH_RUNTIME_VERSION_V0) problems.push('Runtime version must be 0.')
  problems.push(...validateMorphRuntimeDocumentFields(value))
  return problems
}

export function validateMorphRuntimeDocumentV1(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime document must be an object.']
  if (value.schema !== MORPH_RUNTIME_SCHEMA_V1) problems.push(`Runtime schema must be "${MORPH_RUNTIME_SCHEMA_V1}".`)
  if (value.version !== MORPH_RUNTIME_VERSION_V1) problems.push('Runtime version must be 1.')
  problems.push(...validateMorphRuntimeDocumentFields(value))
  if (value.migration != null) problems.push(...validateRuntimeMigrationV1(value.migration))
  if (!sceneUsesRibbonGeometry(value.scene)) problems.push('Runtime v1 document must contain at least one ribbon geometry.')
  return problems
}

export function validateMorphRuntimeDocumentV2(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime document must be an object.']
  if (value.schema !== MORPH_RUNTIME_SCHEMA_V2) problems.push(`Runtime schema must be "${MORPH_RUNTIME_SCHEMA_V2}".`)
  if (value.version !== MORPH_RUNTIME_VERSION_V2) problems.push('Runtime version must be 2.')
  problems.push(...validateMorphRuntimeDocumentFields(value))
  problems.push(...validateRuntimeMigrationV2(value.migration))
  problems.push(...validateRuntimeTimelineV2(value.timeline, value.scene))
  return problems
}

function validateMorphRuntimeDocumentFields(value: Record<string, unknown>): string[] {
  const problems: string[] = []
  if (!isNonEmptyString(value.exportedAt)) problems.push('Runtime exportedAt must be a non-empty string.')
  if (value.manifest != null) problems.push(...validateRuntimeManifestV0(value.manifest))
  if (value.capabilities != null) problems.push(...validateRuntimeCapabilitiesV0(value.capabilities))
  if (value.renderTier != null && (typeof value.renderTier !== 'string' || !RENDER_TIERS.has(value.renderTier))) {
    problems.push(`Runtime renderTier must be one of: ${MORPH_RUNTIME_RENDER_TIERS_V0.join(', ')}.`)
  }
  if (value.quality != null && (typeof value.quality !== 'string' || !QUALITY_HINTS.has(value.quality))) {
    problems.push(`Runtime quality must be one of: ${MORPH_RUNTIME_QUALITY_HINTS_V0.join(', ')}.`)
  }
  if (value.fallbacks != null) problems.push(...validateRuntimeFallbacksV0(value.fallbacks))
  if (value.settings != null) problems.push(...validateRuntimeSettingsV0(value.settings))
  if (value.controllers != null) problems.push(...validateRuntimeControllersV0(value.controllers))
  if (value.generated != null) problems.push(...validateRuntimeGeneratedArtifactsV0(value.generated))
  if (value.cache != null) problems.push(...validateRuntimeCacheV0(value.cache))
  problems.push(...validateDrawableSceneV0(value.scene))
  return problems
}

function validateRuntimeMigrationV1(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime migration must be an object.']
  if (value.fromSchema != null && value.fromSchema !== MORPH_RUNTIME_SCHEMA_V0) {
    problems.push(`Runtime migration fromSchema must be "${MORPH_RUNTIME_SCHEMA_V0}".`)
  }
  if (value.reason != null && !isNonEmptyString(value.reason)) problems.push('Runtime migration reason must be a non-empty string.')
  if (value.preservesV0Playback != null && typeof value.preservesV0Playback !== 'boolean') {
    problems.push('Runtime migration preservesV0Playback must be boolean.')
  }
  return problems
}

function validateRuntimeMigrationV2(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime v2 migration must be an object.']
  if (value.fromSchema !== MORPH_RUNTIME_SCHEMA_V0 && value.fromSchema !== MORPH_RUNTIME_SCHEMA_V1) {
    problems.push(`Runtime v2 migration fromSchema must be "${MORPH_RUNTIME_SCHEMA_V0}" or "${MORPH_RUNTIME_SCHEMA_V1}".`)
  }
  if (value.reason !== 'timeline-keyframes') problems.push('Runtime v2 migration reason must be timeline-keyframes.')
  if (value.preservesPriorPlayback !== true) problems.push('Runtime v2 migration must preserve prior playback.')
  return problems
}

function validateRuntimeTimelineV2(value: unknown, scene: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime v2 timeline must be an object.']
  if (!isNonEmptyString(value.id)) problems.push('Runtime v2 timeline id must be a non-empty string.')
  if (value.label != null && !isNonEmptyString(value.label)) problems.push('Runtime v2 timeline label must be a non-empty string.')
  if (!isFinitePositiveNumber(value.durationMs)) problems.push('Runtime v2 timeline durationMs must be finite and greater than zero.')
  if (value.loop != null && typeof value.loop !== 'boolean') problems.push('Runtime v2 timeline loop must be boolean.')
  if (!Array.isArray(value.tracks) || value.tracks.length < 1) {
    problems.push('Runtime v2 timeline requires one state-progress track, followed only by layer-transform tracks.')
    return problems
  }
  const stateIds = runtimeSceneStateIds(scene)
  const layerIds = runtimeSceneLayerIds(scene)
  const trackIds = new Set<string>()
  const transformTargets = new Set<string>()
  let stateTrackCount = 0
  for (const [trackIndex, track] of value.tracks.entries()) {
    if (!isRecord(track)) {
      problems.push(`Runtime v2 timeline track ${trackIndex} must be an object.`)
      continue
    }
    if (!isNonEmptyString(track.id)) {
      problems.push(`Runtime v2 timeline track ${trackIndex} id must be a non-empty string.`)
    } else if (trackIds.has(track.id)) {
      problems.push(`Runtime v2 timeline track id "${track.id}" must be unique.`)
    } else {
      trackIds.add(track.id)
    }
    if (track.label != null && !isNonEmptyString(track.label)) problems.push(`Runtime v2 timeline track ${trackIndex} label must be a non-empty string.`)
    if (!isRecord(track.target)) {
      problems.push(`Runtime v2 timeline track ${trackIndex} target must be an object.`)
    } else if (track.target.kind === 'state-progress') {
      stateTrackCount += 1
      if (trackIndex !== 0) problems.push('Runtime v2 state-progress track must be first.')
      for (const field of ['fromState', 'toState'] as const) {
        const state = track.target[field]
        if (!isNonEmptyString(state) || !stateIds.has(state)) problems.push(`Runtime v2 timeline target ${field} must name a scene state.`)
      }
    } else if (track.target.kind === 'layer-transform') {
      if (!isNonEmptyString(track.target.layerId) || !layerIds.has(track.target.layerId)) {
        problems.push(`Runtime v2 timeline layer-transform target must name a scene layer.`)
      }
      if (!['translateX', 'translateY', 'rotationDeg'].includes(String(track.target.property))) {
        problems.push('Runtime v2 timeline layer-transform property must be translateX, translateY, or rotationDeg.')
      }
      if (isNonEmptyString(track.target.layerId) && typeof track.target.property === 'string') {
        const key = `${track.target.layerId}:${track.target.property}`
        if (transformTargets.has(key)) problems.push(`Runtime v2 timeline layer-transform target "${key}" must be unique.`)
        transformTargets.add(key)
      }
    } else {
      problems.push(`Runtime v2 timeline track ${trackIndex} target must be state-progress or layer-transform.`)
    }
    problems.push(...validateRuntimeTimelineKeyframesV2(track.keyframes, value.durationMs, trackIndex, track.target))
  }
  if (stateTrackCount !== 1) problems.push('Runtime v2 timeline requires exactly one state-progress track.')
  return problems
}

function validateRuntimeTimelineKeyframesV2(
  value: unknown,
  durationMs: unknown,
  trackIndex: number,
  target: unknown,
): string[] {
  const problems: string[] = []
  if (!Array.isArray(value) || value.length < 2) return [`Runtime v2 timeline track ${trackIndex} requires at least two keyframes.`]
  const isStateProgress = isRecord(target) && target.kind === 'state-progress'
  let previousTime = -Infinity
  for (const [index, keyframe] of value.entries()) {
    if (!isRecord(keyframe)) {
      problems.push(`Runtime v2 timeline track ${trackIndex} keyframe ${index} must be an object.`)
      continue
    }
    const timeMs = keyframe.timeMs
    if (!isFiniteNonNegativeNumber(timeMs) || timeMs <= previousTime || (typeof durationMs === 'number' && timeMs > durationMs)) {
      problems.push(`Runtime v2 timeline track ${trackIndex} keyframe ${index} timeMs must be strictly increasing inside the duration.`)
    }
    if (typeof timeMs === 'number') previousTime = timeMs
    if (typeof keyframe.value !== 'number' || !Number.isFinite(keyframe.value) || (isStateProgress && (keyframe.value < 0 || keyframe.value > 1))) {
      problems.push(isStateProgress
        ? `Runtime v2 timeline track ${trackIndex} keyframe ${index} value must be finite inside 0...1.`
        : `Runtime v2 timeline track ${trackIndex} keyframe ${index} value must be finite.`)
    }
    if (keyframe.easing != null && !['linear', 'ease-in', 'ease-out', 'ease-in-out', 'smoothstep', 'hold'].includes(String(keyframe.easing))) {
      problems.push(`Runtime v2 timeline track ${trackIndex} keyframe ${index} easing is unsupported.`)
    }
  }
  return problems
}

function runtimeSceneStateIds(value: unknown): Set<string> {
  if (!isRecord(value)) return new Set()
  const ids = new Set<string>()
  if (isNonEmptyString(value.entry)) ids.add(value.entry)
  if (isRecord(value.states)) Object.keys(value.states).forEach((id) => ids.add(id))
  if (isRecord(value.stateGraph) && isRecord(value.stateGraph.states)) Object.keys(value.stateGraph.states).forEach((id) => ids.add(id))
  return ids
}

function runtimeSceneLayerIds(value: unknown): Set<string> {
  if (!isRecord(value) || !Array.isArray(value.layers)) return new Set()
  return new Set(value.layers.filter(isRecord).map((layer) => layer.id).filter(isNonEmptyString))
}

function isFinitePositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isFiniteNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function uniqueCapabilities(capabilities: MorphRuntimeCapabilityV0[]): MorphRuntimeCapabilityV0[] {
  return [...new Set(capabilities)]
}

function sceneUsesStateMotion(scene: DrawableScene): boolean {
  if (scene.scrub) return true
  if ((scene.motion?.length ?? 0) > 0) return true
  if ((scene.transitions?.length ?? 0) > 0) return true
  if ((scene.stateGraph?.transitions?.length ?? 0) > 0) return true
  if ((scene.stateGraph?.listeners?.length ?? 0) > 0) return true
  if (Object.keys(scene.states ?? {}).length > 1) return true
  return scene.layers.some((layer) =>
    (layer.motion?.length ?? 0) > 0 ||
    Object.keys(layer.states ?? {}).length > 0
  )
}

function sceneUsesScrollScrub(scene: DrawableScene): boolean {
  return !!scene.scrub
}

function sceneUsesAdditiveOverlays(scene: DrawableScene): boolean {
  return scene.composition?.mode === 'scrub-additive-overlays'
}

function sceneUsesProceduralMarks(scene: DrawableScene): boolean {
  return scene.layers.some((layer) => {
    if (layer.edge) return true
    if (layer.fill?.grain || layer.fill?.hatching) return true
    if (layer.inner?.innerShadow || layer.inner?.highlight || layer.inner?.shadePasses?.length || layer.inner?.autoBalance) return true
    const passes = layer.passes
    return !!(passes?.edge || passes?.grain || passes?.hatching || passes?.innerShadow || passes?.highlight)
  })
}

function sceneUsesImageFill(scene: DrawableScene): boolean {
  return scene.layers.some((layer) => !!layer.fill?.image)
}

function sceneUsesRibbonGeometry(value: unknown): boolean {
  if (!isRecord(value) || !Array.isArray(value.layers)) return false
  return value.layers.some((layer) => {
    if (!isRecord(layer)) return false
    if (geometryIsRibbon(layer.geometry)) return true
    if (!isRecord(layer.states)) return false
    return Object.values(layer.states).some(geometryIsRibbon)
  })
}

function geometryIsRibbon(value: unknown): boolean {
  return isRecord(value) && value.kind === 'ribbon'
}

function inferRuntimeControllersV0(scene: DrawableScene): MorphRuntimeControllerV0[] {
  const triggers = new Set<string>()
  for (const motion of scene.motion ?? []) triggers.add(motion.trigger)
  for (const transition of scene.transitions ?? []) triggers.add(transition.trigger)
  for (const transition of scene.stateGraph?.transitions ?? []) triggers.add(transition.trigger)
  for (const layer of scene.stateGraph?.layers ?? []) {
    for (const transition of layer.transitions ?? []) triggers.add(transition.trigger)
  }
  for (const layer of scene.layers) {
    for (const motion of layer.motion ?? []) triggers.add(motion.trigger)
  }

  const controllers = new Map<string, MorphRuntimeControllerV0>()
  if (scene.scrub) {
    controllers.set('scroll-progress', {
      id: 'scroll-progress',
      type: 'slider',
      label: 'Scroll Progress',
      channel: 'viewport',
      default: 0,
      min: 0,
      max: 1,
    })
  }
  for (const trigger of triggers) {
    const id = controllerIdForTrigger(trigger)
    if (!id || controllers.has(id)) continue
    controllers.set(id, {
      id,
      type: 'trigger',
      label: titleCase(id),
      channel: controllerChannelForTrigger(trigger),
    })
  }
  return [...controllers.values()]
}

function controllerIdForTrigger(trigger: string): string {
  return trigger
    .replace(/-(on|off)$/u, '')
    .replace(/[^a-zA-Z0-9_-]+/gu, '-')
    .replace(/^-+|-+$/gu, '')
}

function controllerChannelForTrigger(trigger: string): string {
  if (/hover|press|click|pointer/u.test(trigger)) return 'pointer'
  if (/focus/u.test(trigger)) return 'focus'
  if (/scroll|in-view|inView/u.test(trigger)) return 'viewport'
  return 'event'
}

function titleCase(value: string): string {
  return value
    .split(/[-_]+/u)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

function validateRuntimeManifestV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime manifest must be an object.']
  for (const field of ['title', 'description', 'author'] as const) {
    if (value[field] != null && typeof value[field] !== 'string') problems.push(`Runtime manifest ${field} must be a string.`)
  }
  if (value.tags != null && (!Array.isArray(value.tags) || !value.tags.every(isNonEmptyString))) {
    problems.push('Runtime manifest tags must be non-empty strings.')
  }
  return problems
}

function validateRuntimeCapabilitiesV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime capabilities must be an object.']
  for (const field of ['required', 'optional'] as const) {
    if (value[field] != null && (!Array.isArray(value[field]) || !value[field].every(isNonEmptyString))) {
      problems.push(`Runtime capabilities ${field} must be non-empty strings.`)
      continue
    }
    if (Array.isArray(value[field])) {
      value[field].forEach((capability) => {
        if (!CAPABILITIES.has(capability)) {
          problems.push(`Runtime capabilities ${field} "${capability}" is not supported.`)
        }
      })
    }
  }
  return problems
}

function validateRuntimeFallbacksV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime fallbacks must be an object.']
  if (value.static != null) problems.push(...validateStaticFallbackV0(value.static, 'Runtime static fallback'))
  if (value.reducedMotion != null && (typeof value.reducedMotion !== 'string' || !REDUCED_MOTION_FALLBACKS.has(value.reducedMotion))) {
    problems.push(`Runtime reducedMotion fallback must be one of: ${MORPH_RUNTIME_REDUCED_MOTION_FALLBACKS_V0.join(', ')}.`)
  }
  if (value.quality != null) {
    if (!isRecord(value.quality)) {
      problems.push('Runtime quality fallbacks must be an object.')
    } else {
      for (const [quality, fallback] of Object.entries(value.quality)) {
        if (!QUALITY_HINTS.has(quality)) {
          problems.push(`Runtime quality fallback "${quality}" is not supported.`)
          continue
        }
        problems.push(...validateStaticFallbackV0(fallback, `Runtime ${quality} fallback`))
      }
    }
  }
  return problems
}

function validateRuntimeSettingsV0(value: unknown): string[] {
  if (!isRecord(value)) return ['Runtime settings must be an object.']
  const mode = value.boil
  if (mode == null || mode === 'always' || mode === 'active-only' || mode === 'off') return []
  return ['Runtime boil mode must be one of: always, active-only, off.']
}

function validateStaticFallbackV0(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (value.kind !== 'svg' && value.kind !== 'png' && value.kind !== 'webp') problems.push(`${label} kind must be svg, png, or webp.`)
  if (value.href != null && typeof value.href !== 'string') problems.push(`${label} href must be a string.`)
  if (value.data != null && typeof value.data !== 'string') problems.push(`${label} data must be a string.`)
  if (value.width != null && !isPositiveNumber(value.width)) problems.push(`${label} width must be positive.`)
  if (value.height != null && !isPositiveNumber(value.height)) problems.push(`${label} height must be positive.`)
  return problems
}

function validateRuntimeControllersV0(value: unknown): string[] {
  if (!Array.isArray(value)) return ['Runtime controllers must be an array.']
  return value.flatMap((controller, index) => validateRuntimeControllerV0(controller, index))
}

function validateRuntimeControllerV0(value: unknown, index: number): string[] {
  const label = `Runtime controller ${index + 1}`
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (!isNonEmptyString(value.id)) problems.push(`${label} needs an id.`)
  if (!isNonEmptyString(value.type)) problems.push(`${label} needs a type.`)
  if (value.label != null && typeof value.label !== 'string') problems.push(`${label} label must be a string.`)
  if (value.channel != null && !isNonEmptyString(value.channel)) problems.push(`${label} channel must be a non-empty string.`)
  if (value.min != null && !isFiniteNumber(value.min)) problems.push(`${label} min must be finite.`)
  if (value.max != null && !isFiniteNumber(value.max)) problems.push(`${label} max must be finite.`)
  if (isFiniteNumber(value.min) && isFiniteNumber(value.max) && value.min > value.max) problems.push(`${label} min cannot exceed max.`)
  if (value.options != null && (!Array.isArray(value.options) || !value.options.every(isNonEmptyString))) problems.push(`${label} options must be non-empty strings.`)
  if (value.default != null) problems.push(...validateRuntimeControllerDefaultV0(value.default, label))
  return problems
}

function validateRuntimeControllerDefaultV0(value: unknown, label: string): string[] {
  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') return []
  if (isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y)) return []
  return [`${label} default must be boolean, number, string, or x/y point.`]
}

function validateRuntimeGeneratedArtifactsV0(value: unknown): string[] {
  if (!Array.isArray(value)) return ['Runtime generated artifacts must be an array.']
  return value.flatMap((artifact, index) => validateRuntimeGeneratedArtifactV0(artifact, index))
}

function validateRuntimeGeneratedArtifactV0(value: unknown, index: number): string[] {
  const label = `Runtime generated artifact ${index + 1}`
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (!isNonEmptyString(value.id)) problems.push(`${label} needs an id.`)
  if (!isNonEmptyString(value.kind)) problems.push(`${label} needs a kind.`)
  if (!isNonEmptyString(value.owner)) problems.push(`${label} needs an owner.`)
  for (const field of ['target', 'sourceState', 'targetState', 'createdAt'] as const) {
    if (value[field] != null && typeof value[field] !== 'string') problems.push(`${label} ${field} must be a string.`)
  }
  for (const field of ['clearable', 'baked'] as const) {
    if (value[field] != null && typeof value[field] !== 'boolean') problems.push(`${label} ${field} must be a boolean.`)
  }
  return problems
}

function validateRuntimeCacheV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime cache must be an object.']
  if (value.fields == null) return problems
  const fields = value.fields
  if (!isRecord(fields)) return ['Runtime field cache must be an object.']
  if (fields.kind !== 'field-cache') problems.push('Runtime field cache kind must be field-cache.')
  if (fields.version !== 0) problems.push('Runtime field cache version must be 0.')
  if (fields.policy != null && (typeof fields.policy !== 'string' || !FIELD_CACHE_POLICIES.has(fields.policy))) {
    problems.push(`Runtime field cache policy must be one of: ${MORPH_RUNTIME_FIELD_CACHE_POLICIES_V0.join(', ')}.`)
  }
  if (!Array.isArray(fields.layers)) {
    problems.push('Runtime field cache layers must be an array.')
  } else {
    fields.layers.forEach((layer, index) => {
      if (!isRecord(layer)) {
        problems.push(`Runtime field cache layer ${index + 1} must be an object.`)
        return
      }
      if (!isNonEmptyString(layer.layerId)) problems.push(`Runtime field cache layer ${index + 1} needs a layerId.`)
      if (!isNonEmptyString(layer.renderKey)) problems.push(`Runtime field cache layer ${index + 1} needs a renderKey.`)
      if (layer.state !== null && !isNonEmptyString(layer.state)) problems.push(`Runtime field cache layer ${index + 1} state must be null or a non-empty string.`)
      if (!isFiniteNumber(layer.progress) || layer.progress < 0 || layer.progress > 1) problems.push(`Runtime field cache layer ${index + 1} progress must be between 0 and 1.`)
      if (layer.geometryKind !== 'closed') problems.push(`Runtime field cache layer ${index + 1} geometryKind must be closed.`)
      if (!isFiniteNumber(layer.seed)) problems.push(`Runtime field cache layer ${index + 1} seed must be finite.`)
      for (const field of ['points', 'contourSegments', 'contourLength'] as const) {
        if (!isPositiveNumber(layer[field])) problems.push(`Runtime field cache layer ${index + 1} ${field} must be positive.`)
      }
      if (!Array.isArray(layer.bounds) || layer.bounds.length !== 4 || !layer.bounds.every(isFiniteNumber)) {
        problems.push(`Runtime field cache layer ${index + 1} bounds must contain four finite numbers.`)
      }
      if (!Array.isArray(layer.passes) || !layer.passes.every(isNonEmptyString)) {
        problems.push(`Runtime field cache layer ${index + 1} passes are invalid.`)
      }
      if (!Array.isArray(layer.sides) || !layer.sides.every((item) => item === 'inside' || item === 'outside' || item === 'both')) {
        problems.push(`Runtime field cache layer ${index + 1} sides are invalid.`)
      }
      problems.push(...validateSerializedContourField(layer.contour, `Runtime field cache layer ${index + 1} contour`))
    })
  }
  return problems
}

function validateSerializedContourField(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (Array.isArray(value.points)) return problems
  if (!isPositiveNumber(value.length)) problems.push(`${label} length must be positive.`)
  if (Array.isArray(value.segments) && value.segments.length > 0) {
    value.segments.forEach((segment, index) => {
      if (!isRecord(segment)) {
        problems.push(`${label} segment ${index + 1} must be an object.`)
        return
      }
      for (const field of ['ax', 'ay', 'bx', 'by', 'len', 'len2', 'tx', 'ty', 'nx', 'ny', 'start', 'turnA', 'turnB'] as const) {
        if (!isFiniteNumber(segment[field])) problems.push(`${label} segment ${index + 1} ${field} must be finite.`)
      }
      if (isRecord(segment) && !isPositiveNumber(segment.len)) problems.push(`${label} segment ${index + 1} len must be positive.`)
      if (isRecord(segment) && !isPositiveNumber(segment.len2)) problems.push(`${label} segment ${index + 1} len2 must be positive.`)
    })
  } else {
    problems.push(`${label} needs contour.`)
  }
  return problems
}

export function validateDrawableSceneV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime scene must be an object.']
  if (!isNonEmptyString(value.id)) problems.push('Runtime scene needs an id.')
  if (!isNonEmptyString(value.kind)) problems.push('Runtime scene needs a kind.')
  if (!isViewBox(value.viewBox)) problems.push('Runtime scene needs a two-number viewBox.')
  const authoringBlank = isRecord(value.meta) && value.meta.authoringBlank === true
  if (!Array.isArray(value.layers)) {
    problems.push('Runtime scene needs at least one layer.')
  } else if (value.layers.length === 0 && !authoringBlank) {
    problems.push('Runtime scene needs at least one layer.')
  } else {
    value.layers.forEach((layer, index) => {
      problems.push(...validateLayer(layer, index))
    })
  }
  if (value.states != null) problems.push(...validateStateDefinitions(value.states, 'Runtime scene states'))
  if (value.transitions != null) problems.push(...validateStateTransitionArray(value.transitions, 'Runtime scene transitions'))
  if (value.stateGraph != null) problems.push(...validateStateGraphV0(value.stateGraph))
  if (value.composition != null) problems.push(...validateCompositionV0(value.composition))
  if (value.motion != null) problems.push(...validateMotionArray(value.motion, 'Runtime scene motion'))
  return problems
}

function validateCompositionV0(value: unknown): string[] {
  if (!isRecord(value)) return ['Runtime scene composition must be an object.']
  return value.mode === 'scrub-additive-overlays'
    ? []
    : ['Runtime scene composition mode must be scrub-additive-overlays.']
}

function validateStateGraphV0(value: unknown): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return ['Runtime stateGraph must be an object.']
  if (value.entry != null && !isNonEmptyString(value.entry)) problems.push('Runtime stateGraph entry must be a state id.')
  if (value.states != null) problems.push(...validateStateDefinitions(value.states, 'Runtime stateGraph states'))
  if (value.transitions != null) problems.push(...validateStateTransitionArray(value.transitions, 'Runtime stateGraph transitions'))
  if (value.layers != null) {
    if (!Array.isArray(value.layers)) {
      problems.push('Runtime stateGraph layers must be an array.')
    } else {
      value.layers.forEach((layer, index) => {
        const label = `Runtime stateGraph layer ${index + 1}`
        if (!isRecord(layer)) {
          problems.push(`${label} must be an object.`)
          return
        }
        if (!isNonEmptyString(layer.id)) problems.push(`${label} needs an id.`)
        if (layer.label != null && typeof layer.label !== 'string') problems.push(`${label} label must be a string.`)
        if (layer.priority != null && !isFiniteNumber(layer.priority)) problems.push(`${label} priority must be finite.`)
        if (layer.disabled != null && typeof layer.disabled !== 'boolean') problems.push(`${label} disabled must be a boolean.`)
        if (layer.reason != null && typeof layer.reason !== 'string') problems.push(`${label} reason must be a string.`)
        if (layer.states != null) problems.push(...validateStateDefinitions(layer.states, `${label} states`))
        if (layer.transitions != null) problems.push(...validateStateTransitionArray(layer.transitions, `${label} transitions`))
      })
    }
  }
  if (value.listeners != null) {
    if (!Array.isArray(value.listeners)) {
      problems.push('Runtime stateGraph listeners must be an array.')
    } else {
      value.listeners.forEach((listener, index) => {
        const label = `Runtime stateGraph listener ${index + 1}`
        if (!isRecord(listener)) {
          problems.push(`${label} must be an object.`)
          return
        }
        if (listener.id != null && typeof listener.id !== 'string') problems.push(`${label} id must be a string.`)
        if (listener.target != null && typeof listener.target !== 'string') problems.push(`${label} target must be a string.`)
        if (!isNonEmptyString(listener.listenTo)) problems.push(`${label} needs listenTo.`)
        if (!isNonEmptyString(listener.action)) problems.push(`${label} needs action.`)
        if (listener.trigger != null && typeof listener.trigger !== 'string') problems.push(`${label} trigger must be a string.`)
        if (listener.controllerId != null && typeof listener.controllerId !== 'string') problems.push(`${label} controllerId must be a string.`)
        if (listener.disabled != null && typeof listener.disabled !== 'boolean') problems.push(`${label} disabled must be a boolean.`)
      })
    }
  }
  return problems
}

function validateStateDefinitions(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  Object.entries(value).forEach(([id, definition]) => {
    if (!isNonEmptyString(id)) problems.push(`${label} includes an empty state id.`)
    if (!isRecord(definition)) {
      problems.push(`${label} ${id} must be an object.`)
      return
    }
    if (definition.label != null && typeof definition.label !== 'string') problems.push(`${label} ${id} label must be a string.`)
    if (definition.kind != null && typeof definition.kind !== 'string') problems.push(`${label} ${id} kind must be a string.`)
    if (definition.meta != null && !isRecord(definition.meta)) problems.push(`${label} ${id} meta must be an object.`)
  })
  return problems
}

function validateStateTransitionArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) return [`${label} must be an array.`]
  return value.flatMap((transition, index) => validateStateTransitionV0(transition, `${label} ${index + 1}`))
}

function validateStateTransitionV0(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (value.id != null && typeof value.id !== 'string') problems.push(`${label} id must be a string.`)
  if (value.from != null && !isNonEmptyString(value.from)) problems.push(`${label} from must be a state id or "*".`)
  if (!isNonEmptyString(value.to)) problems.push(`${label} needs a target state.`)
  if (!isNonEmptyString(value.trigger)) problems.push(`${label} needs a trigger.`)
  if (value.easing != null && typeof value.easing !== 'string') problems.push(`${label} easing must be a string.`)
  if (value.style != null && typeof value.style !== 'string') problems.push(`${label} style must be a string.`)
  if (value.layer != null && typeof value.layer !== 'string') problems.push(`${label} layer must be a string.`)
  if (value.disabled != null && typeof value.disabled !== 'boolean') problems.push(`${label} disabled must be a boolean.`)
  if (value.reason != null && typeof value.reason !== 'string') problems.push(`${label} reason must be a string.`)
  for (const field of TIMING_NUMBER_FIELDS) {
    if (value[field] != null && !isNonNegativeNumber(value[field])) problems.push(`${label} ${field} must be a non-negative number.`)
  }
  if (value.fps != null && !isPositiveNumber(value.fps)) problems.push(`${label} fps must be a positive number.`)
  if (value.fpsDivisor != null && (typeof value.fpsDivisor !== 'number' || !FPS_DIVISORS.has(value.fpsDivisor))) {
    problems.push(`${label} fpsDivisor must be 1, 2, or 4.`)
  }
  if (value.returnTo != null && !isNonEmptyString(value.returnTo)) problems.push(`${label} returnTo must be a state id.`)
  if (value.interrupt != null && (typeof value.interrupt !== 'string' || !INTERRUPT_MODES.has(value.interrupt))) {
    problems.push(`${label} interrupt must be restart, continue, queue, or ignore.`)
  }
  if (value.conditions != null && !Array.isArray(value.conditions)) problems.push(`${label} conditions must be an array.`)
  if (value.actions != null && (!Array.isArray(value.actions) || !value.actions.every((action) => isRecord(action) && isNonEmptyString(action.type)))) {
    problems.push(`${label} actions must be objects with a type.`)
  }
  return problems
}

function normalizeLayer(layer: DrawableLayer): DrawableLayer {
  return {
    id: layer.id,
    ...(layer.name ? { name: layer.name } : {}),
    geometry: normalizeGeometry(layer.geometry),
    ...(layer.resolution ? { resolution: layer.resolution } : {}),
    ...(layer.smoothing != null ? { smoothing: layer.smoothing } : {}),
    ...(layer.transform ? { transform: clonePlain(layer.transform) } : {}),
    ...(layer.edge ? { edge: clonePlain(layer.edge) } : {}),
    ...(layer.fill ? { fill: clonePlain(layer.fill) } : {}),
    ...(layer.inner ? { inner: clonePlain(layer.inner) } : {}),
    ...(layer.passes ? { passes: clonePlain(layer.passes) } : {}),
    ...(layer.states ? { states: normalizeStates(layer.states) } : {}),
    ...(layer.motion ? { motion: clonePlain(layer.motion) } : {}),
    ...(layer.anchor ? { anchor: clonePoint(layer.anchor) } : {}),
  }
}

function normalizeStates(states: NonNullable<DrawableLayer['states']>): NonNullable<DrawableLayer['states']> {
  return Object.fromEntries(Object.entries(states).map(([key, geometry]) => [key, normalizeGeometry(geometry)]))
}

function normalizeGeometry(geometry: GeometryPrimitive): GeometryPrimitive {
  if (geometry.kind === 'closed') return { kind: 'closed', points: clonePoints(geometry.points) }
  if (geometry.kind === 'open') return { kind: 'open', points: clonePoints(geometry.points) }
  if (geometry.kind === 'multi') return { kind: 'multi', groups: geometry.groups.map(clonePoints) }
  return {
    kind: 'ribbon',
    strokes: geometry.strokes.map((stroke) => stroke.map(cloneStrokePoint)),
    ...(geometry.style ? { style: clonePlain(geometry.style) } : {}),
  }
}

function validateLayer(value: unknown, index: number): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`Layer ${index + 1} must be an object.`]
  if (!isNonEmptyString(value.id)) problems.push(`Layer ${index + 1} needs an id.`)
  problems.push(...validateGeometry(value.geometry, `Layer ${index + 1}`))
  if (value.states != null) problems.push(...validateLayerStateGeometry(value.states, `Layer ${index + 1} states`))
  if (value.fill != null) problems.push(...validateFill(value.fill, `Layer ${index + 1} fill`))
  if (value.transform != null) problems.push(...validateLayerTransform(value.transform, `Layer ${index + 1} transform`))
  if (value.motion != null) problems.push(...validateMotionArray(value.motion, `Layer ${index + 1} motion`))
  return problems
}

function validateLayerStateGeometry(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  Object.entries(value).forEach(([state, geometry]) => {
    if (!isNonEmptyString(state)) problems.push(`${label} includes an empty state id.`)
    problems.push(...validateGeometry(geometry, `${label} ${state}`))
  })
  return problems
}

function validateFill(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (value.fill != null && typeof value.fill !== 'string') problems.push(`${label} fill must be a string.`)
  if (value.opacity != null && !isFiniteNumber(value.opacity)) problems.push(`${label} opacity must be finite.`)
  if (value.image != null) problems.push(...validateImageFill(value.image, `${label} image`))
  return problems
}

function validateImageFill(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (!isNonEmptyString(value.href)) problems.push(`${label} href must be a non-empty string.`)
  for (const field of ['x', 'y', 'width', 'height'] as const) {
    if (value[field] != null && !isFiniteNumber(value[field])) problems.push(`${label} ${field} must be finite.`)
  }
  if (value.width != null && isFiniteNumber(value.width) && value.width <= 0) problems.push(`${label} width must be positive.`)
  if (value.height != null && isFiniteNumber(value.height) && value.height <= 0) problems.push(`${label} height must be positive.`)
  if (value.preserveAspectRatio != null && typeof value.preserveAspectRatio !== 'string') {
    problems.push(`${label} preserveAspectRatio must be a string.`)
  }
  return problems
}

function validateLayerTransform(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  for (const field of ['tx', 'ty', 'scale', 'rotate'] as const) {
    if (value[field] != null && !isFiniteNumber(value[field])) problems.push(`${label} ${field} must be a finite number.`)
  }
  if (value.origin != null && (!isRecord(value.origin) || !isFiniteNumber(value.origin.x) || !isFiniteNumber(value.origin.y))) {
    problems.push(`${label} origin must be a point.`)
  }
  return problems
}

function validateMotionArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) return [`${label} must be an array.`]
  return value.flatMap((motion, index) => validateMotion(motion, `${label} ${index + 1}`))
}

function validateMotion(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (!isNonEmptyString(value.trigger)) problems.push(`${label} needs a trigger.`)
  if (!isNonEmptyString(value.to)) problems.push(`${label} needs a target state.`)
  if (!isNonEmptyString(value.easing)) problems.push(`${label} needs easing.`)
  for (const field of TIMING_NUMBER_FIELDS) {
    if (value[field] != null && !isNonNegativeNumber(value[field])) problems.push(`${label} ${field} must be a non-negative number.`)
  }
  if (value.fps != null && !isPositiveNumber(value.fps)) problems.push(`${label} fps must be a positive number.`)
  if (value.fpsDivisor != null && (typeof value.fpsDivisor !== 'number' || !FPS_DIVISORS.has(value.fpsDivisor))) {
    problems.push(`${label} fpsDivisor must be 1, 2, or 4.`)
  }
  if (value.durationMs == null) problems.push(`${label} needs durationMs.`)
  if (value.returnTo != null && !isNonEmptyString(value.returnTo)) problems.push(`${label} returnTo must be a state id.`)
  if (value.interrupt != null && (typeof value.interrupt !== 'string' || !INTERRUPT_MODES.has(value.interrupt))) {
    problems.push(`${label} interrupt must be restart, continue, queue, or ignore.`)
  }
  return problems
}

function validateGeometry(value: unknown, label: string): string[] {
  if (!isRecord(value) || !isNonEmptyString(value.kind)) return [`${label} needs geometry.`]
  if (value.kind === 'closed' || value.kind === 'open') {
    return hasPointList(value.points, value.kind === 'closed' ? 3 : 2) ? [] : [`${label} ${value.kind} geometry has too few points.`]
  }
  if (value.kind === 'multi') {
    return Array.isArray(value.groups) && value.groups.every((group) => hasPointList(group, 3)) ? [] : [`${label} multi geometry has an invalid group.`]
  }
  if (value.kind === 'ribbon') {
    const problems: string[] = []
    if (!Array.isArray(value.strokes) || !value.strokes.every((stroke) => hasPointList(stroke, 2))) problems.push(`${label} ribbon geometry has an invalid stroke.`)
    if (value.style != null) problems.push(...validateRibbonStyle(value.style, `${label} ribbon style`))
    return problems
  }
  return [`${label} geometry kind "${value.kind}" is not supported by v0.`]
}

function validateRibbonStyle(value: unknown, label: string): string[] {
  const problems: string[] = []
  if (!isRecord(value)) return [`${label} must be an object.`]
  if (value.cap != null && !['round', 'butt', 'square'].includes(String(value.cap))) problems.push(`${label} cap must be round, butt, or square.`)
  if (value.join != null && !['round', 'bevel', 'miter'].includes(String(value.join))) problems.push(`${label} join must be round, bevel, or miter.`)
  if (value.taper != null) {
    if (!isRecord(value.taper)) {
      problems.push(`${label} taper must be an object.`)
    } else {
      for (const field of ['start', 'end'] as const) {
        if (value.taper[field] != null && !isUnitNumber(value.taper[field])) problems.push(`${label} taper ${field} must be between 0 and 1.`)
      }
    }
  }
  return problems
}

function clonePoint(point: DrawablePoint): DrawablePoint {
  return { x: point.x, y: point.y }
}

function cloneStrokePoint(point: StrokePoint): StrokePoint {
  return {
    x: point.x,
    y: point.y,
    ...(point.t != null ? { t: point.t } : {}),
    ...(point.w != null ? { w: point.w } : {}),
  }
}

function clonePoints(points: DrawablePoint[]): DrawablePoint[] {
  return points.map(clonePoint)
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isViewBox(value: unknown): value is [number, number] {
  return Array.isArray(value) && value.length === 2 && value.every((item) => typeof item === 'number' && Number.isFinite(item) && item > 0)
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isUnitNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function hasPointList(value: unknown, minLength: number): boolean {
  return Array.isArray(value) && value.length >= minLength && value.every((point) => isRecord(point) && typeof point.x === 'number' && typeof point.y === 'number')
}
