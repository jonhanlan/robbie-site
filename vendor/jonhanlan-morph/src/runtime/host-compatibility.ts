import {
  createMorphRuntimeHostCompatibilityReportForDocumentV0,
  type MorphRuntimeHostCompatibilityReportV0,
} from './host-compatibility-core'
export {
  MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0,
  MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0,
  createMorphRuntimeHostCompatibilityReportForDocumentV0,
  runtimeRequiresStateEnginePlayerV0,
  type MorphRuntimeHostAdapterV0,
  type MorphRuntimeHostCompatibilityReportV0,
  type MorphRuntimeHostCompatibilitySourceV0,
  type MorphRuntimeHostFieldCacheV0,
  type MorphRuntimeHostInputV0,
  type MorphRuntimeHostMediaAssetV0,
  type MorphRuntimeHostShadePipelinePassV0,
  type MorphRuntimeHostShadePipelineV0,
} from './host-compatibility-core'
import {
  listMorphRuntimeExportsV0,
  morphRuntimeExportManifestV0,
  resolveMorphRuntimeExportV0,
  type MorphRuntimeExportV0,
} from './export-manifest'
import { resolveMorphRuntimeHostAdapterV0 } from './host-adapters'

export const MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_SCHEMA_V0 = 'morph-runtime-host-compatibility-manifest/v0' as const
export const MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_VERSION_V0 = 0 as const

export type MorphRuntimeHostCompatibilityManifestV0 = {
  schema: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_SCHEMA_V0
  version: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_VERSION_V0
  generatedAt: string
  reports: MorphRuntimeHostCompatibilityReportV0[]
}

export function resolveMorphRuntimeHostCompatibilityReportV0(
  storageKey: string,
): MorphRuntimeHostCompatibilityReportV0 | null {
  const runtimeExport = resolveMorphRuntimeExportV0(storageKey)
  if (!runtimeExport) return null
  return createMorphRuntimeHostCompatibilityReportV0(runtimeExport)
}

export function listMorphRuntimeHostCompatibilityReportsV0(): MorphRuntimeHostCompatibilityReportV0[] {
  return listMorphRuntimeExportsV0().map(createMorphRuntimeHostCompatibilityReportV0)
}

export function createMorphRuntimeHostCompatibilityManifestV0(): MorphRuntimeHostCompatibilityManifestV0 {
  return {
    schema: MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_SCHEMA_V0,
    version: MORPH_RUNTIME_HOST_COMPATIBILITY_MANIFEST_VERSION_V0,
    generatedAt: morphRuntimeExportManifestV0.generatedAt,
    reports: listMorphRuntimeHostCompatibilityReportsV0(),
  }
}

export function createMorphRuntimeHostCompatibilityReportV0(
  runtimeExport: MorphRuntimeExportV0,
): MorphRuntimeHostCompatibilityReportV0 {
  const hostAdapter = resolveMorphRuntimeHostAdapterV0(runtimeExport.entry.storageKey)
  return createMorphRuntimeHostCompatibilityReportForDocumentV0(runtimeExport.document, {
    storageKey: runtimeExport.entry.storageKey,
    artifactPath: runtimeExport.entry.path,
    sceneId: runtimeExport.entry.sceneId,
    sceneKind: runtimeExport.entry.sceneKind,
    title: runtimeExport.entry.title,
    byteLength: runtimeExport.artifactBytes,
    renderTier: runtimeExport.summary.renderTier,
    quality: runtimeExport.summary.quality,
    requiredCapabilities: runtimeExport.summary.requiredCapabilities,
    optionalCapabilities: runtimeExport.summary.optionalCapabilities,
    reducedMotionFallback: runtimeExport.summary.reducedMotionFallback,
    ...(hostAdapter ? { hostAdapter } : {}),
  })
}
