import runtimeExportManifestJson from '../../exports/runtime/manifest.json'
import type { MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'
import {
  dryOrnamentRuntimeArtifactBytesV0,
  dryOrnamentRuntimeDocumentV0,
} from './dry-ornament'
import {
  flowOrnamentRuntimeArtifactBytesV0,
  flowOrnamentRuntimeDocumentV0,
} from './flow-ornament'
import {
  flowerOrnamentRuntimeArtifactBytesV0,
  flowerOrnamentRuntimeDocumentV0,
} from './flower-ornament'
import {
  grainOrnamentRuntimeArtifactBytesV0,
  grainOrnamentRuntimeDocumentV0,
} from './grain-ornament'
import {
  markSetOrnamentRuntimeArtifactBytesV0,
  markSetOrnamentRuntimeDocumentV0,
} from './mark-set-ornament'
import {
  relitMarkSetOrnamentRuntimeArtifactBytesV0,
  relitMarkSetOrnamentRuntimeDocumentV0,
} from './relit-mark-set-ornament'
import {
  proceduralSceneRuntimeArtifactBytesV0,
  proceduralSceneRuntimeDocumentV0,
} from './procedural-scene'
import {
  profileMaskRuntimeArtifactBytesV0,
  profileMaskRuntimeDocumentV0,
} from './profile-mask'
import {
  scratchOrnamentRuntimeArtifactBytesV0,
  scratchOrnamentRuntimeDocumentV0,
} from './scratch-ornament'
import {
  scrollDemoCombinedRuntimeArtifactBytesV0,
  scrollDemoCombinedRuntimeDocumentV0,
} from './scroll-demo-combined'
import {
  scrollDemoCueInViewRuntimeArtifactBytesV0,
  scrollDemoCueInViewRuntimeDocumentV0,
} from './scroll-demo-cue-in-view'
import {
  scrollDemoHeroRuntimeArtifactBytesV0,
  scrollDemoHeroRuntimeDocumentV0,
} from './scroll-demo-hero'
import {
  scrollDemoPageRuntimeArtifactBytesV0,
  scrollDemoPageRuntimeDocumentV0,
} from './scroll-demo-page'
import {
  scrollDemoScrollPastRuntimeArtifactBytesV0,
  scrollDemoScrollPastRuntimeDocumentV0,
} from './scroll-demo-scroll-past'
import {
  scrollDemoTravelRuntimeArtifactBytesV0,
  scrollDemoTravelRuntimeDocumentV0,
} from './scroll-demo-travel'
import {
  signatureClosedOutlineRuntimeArtifactBytesV0,
  signatureClosedOutlineRuntimeDocumentV0,
} from './signature-closed-outline'
import {
  signatureRuntimeArtifactBytesV0,
  signatureRuntimeDocumentV0,
} from './signature'
import {
  signaturePathMorphProofRuntimeArtifactBytesV0,
  signaturePathMorphProofRuntimeDocumentV0,
} from './signature-path-morph-proof'
import {
  signatureRibbonBaselineRuntimeArtifactBytesV0,
  signatureRibbonBaselineRuntimeDocumentV0,
} from './signature-ribbon-baseline'
import {
  stippleOrnamentRuntimeArtifactBytesV0,
  stippleOrnamentRuntimeDocumentV0,
} from './stipple-ornament'
import { morphRuntimeArtifactSummaryV0, type MorphRuntimeArtifactSummaryV0 } from './artifact-summary'

export const MORPH_RUNTIME_EXPORT_MANIFEST_SCHEMA_V0 = 'morph-runtime-export-manifest/v0' as const
export const MORPH_RUNTIME_EXPORT_MANIFEST_VERSION_V0 = 0 as const

export type MorphRuntimeExportManifestEntryV0 = {
  storageKey: string
  path: string
  schema: string
  version: number
  sceneId: string
  sceneKind: string
  title?: string
  description?: string
  tags: string[]
  exportedAt: string
  latestGeneratedAt: string
  renderTier?: string
  quality?: string
  byteLength: number
  generatedIds: string[]
  requiredCapabilities: string[]
  optionalCapabilities: string[]
  controllers: string[]
  fieldCacheLayerCount: number
  cachedProgresses: number[]
  default?: boolean
}

export type MorphRuntimeExportManifestV0 = {
  schema: typeof MORPH_RUNTIME_EXPORT_MANIFEST_SCHEMA_V0
  version: typeof MORPH_RUNTIME_EXPORT_MANIFEST_VERSION_V0
  generatedAt: string
  defaultStorageKey: string
  entries: MorphRuntimeExportManifestEntryV0[]
}

export type MorphRuntimeExportV0 = {
  entry: MorphRuntimeExportManifestEntryV0
  document: MorphRuntimeDocumentV0
  artifactBytes: number
  summary: MorphRuntimeArtifactSummaryV0
}

const runtimeDocumentsByStorageKey: Record<string, MorphRuntimeDocumentV0> = {
  'dry-ornament': dryOrnamentRuntimeDocumentV0,
  'flow-ornament': flowOrnamentRuntimeDocumentV0,
  'flower-ornament': flowerOrnamentRuntimeDocumentV0,
  'grain-ornament': grainOrnamentRuntimeDocumentV0,
  'mark-set-ornament': markSetOrnamentRuntimeDocumentV0,
  'procedural-scene': proceduralSceneRuntimeDocumentV0,
  'profile-mask': profileMaskRuntimeDocumentV0,
  'relit-mark-set-ornament': relitMarkSetOrnamentRuntimeDocumentV0,
  'scratch-ornament': scratchOrnamentRuntimeDocumentV0,
  'scroll-demo-combined': scrollDemoCombinedRuntimeDocumentV0,
  'scroll-demo-cue-in-view': scrollDemoCueInViewRuntimeDocumentV0,
  'scroll-demo-hero': scrollDemoHeroRuntimeDocumentV0,
  'scroll-demo-page': scrollDemoPageRuntimeDocumentV0,
  'scroll-demo-scroll-past': scrollDemoScrollPastRuntimeDocumentV0,
  'scroll-demo-travel': scrollDemoTravelRuntimeDocumentV0,
  signature: signatureRuntimeDocumentV0,
  'signature-closed-outline': signatureClosedOutlineRuntimeDocumentV0,
  'signature-path-morph-proof': signaturePathMorphProofRuntimeDocumentV0,
  'signature-ribbon-baseline': signatureRibbonBaselineRuntimeDocumentV0,
  'stipple-ornament': stippleOrnamentRuntimeDocumentV0,
}

const runtimeArtifactBytesByStorageKey: Record<string, number> = {
  'dry-ornament': dryOrnamentRuntimeArtifactBytesV0,
  'flow-ornament': flowOrnamentRuntimeArtifactBytesV0,
  'flower-ornament': flowerOrnamentRuntimeArtifactBytesV0,
  'grain-ornament': grainOrnamentRuntimeArtifactBytesV0,
  'mark-set-ornament': markSetOrnamentRuntimeArtifactBytesV0,
  'procedural-scene': proceduralSceneRuntimeArtifactBytesV0,
  'profile-mask': profileMaskRuntimeArtifactBytesV0,
  'relit-mark-set-ornament': relitMarkSetOrnamentRuntimeArtifactBytesV0,
  'scratch-ornament': scratchOrnamentRuntimeArtifactBytesV0,
  'scroll-demo-combined': scrollDemoCombinedRuntimeArtifactBytesV0,
  'scroll-demo-cue-in-view': scrollDemoCueInViewRuntimeArtifactBytesV0,
  'scroll-demo-hero': scrollDemoHeroRuntimeArtifactBytesV0,
  'scroll-demo-page': scrollDemoPageRuntimeArtifactBytesV0,
  'scroll-demo-scroll-past': scrollDemoScrollPastRuntimeArtifactBytesV0,
  'scroll-demo-travel': scrollDemoTravelRuntimeArtifactBytesV0,
  signature: signatureRuntimeArtifactBytesV0,
  'signature-closed-outline': signatureClosedOutlineRuntimeArtifactBytesV0,
  'signature-path-morph-proof': signaturePathMorphProofRuntimeArtifactBytesV0,
  'signature-ribbon-baseline': signatureRibbonBaselineRuntimeArtifactBytesV0,
  'stipple-ornament': stippleOrnamentRuntimeArtifactBytesV0,
}

export const morphRuntimeExportManifestV0 =
  runtimeExportManifestJson as unknown as MorphRuntimeExportManifestV0

export function resolveMorphRuntimeExportV0(storageKey: string): MorphRuntimeExportV0 | null {
  const entry = morphRuntimeExportManifestV0.entries.find((item) => item.storageKey === storageKey)
  const document = runtimeDocumentsByStorageKey[storageKey]
  if (!entry || !document) return null

  const artifactBytes = runtimeArtifactBytesByStorageKey[storageKey] ?? entry.byteLength
  return {
    entry,
    document,
    artifactBytes,
    summary: morphRuntimeArtifactSummaryV0(document, { byteLength: artifactBytes }),
  }
}

export function listMorphRuntimeExportsV0(): MorphRuntimeExportV0[] {
  return morphRuntimeExportManifestV0.entries
    .map((entry) => resolveMorphRuntimeExportV0(entry.storageKey))
    .filter((entry): entry is MorphRuntimeExportV0 => entry !== null)
}

function requireMorphRuntimeDefaultExportV0() {
  const resolved = resolveMorphRuntimeExportV0(morphRuntimeExportManifestV0.defaultStorageKey)
  if (!resolved) {
    throw new Error(`Missing default Morph runtime export: ${morphRuntimeExportManifestV0.defaultStorageKey}`)
  }
  return resolved
}

export const morphRuntimeDefaultExportV0 = requireMorphRuntimeDefaultExportV0()
export const morphRuntimeDefaultExportSummaryV0 = morphRuntimeDefaultExportV0.summary
