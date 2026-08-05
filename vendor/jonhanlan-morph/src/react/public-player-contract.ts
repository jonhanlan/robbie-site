import {
  morphRuntimeFieldCacheSourceLabelV0,
  morphRuntimeFieldCacheStatusV0,
  type MorphRuntimeFieldCacheSourceV0,
} from '../drawable/runtime-playback-policy'
import {
  listMorphRuntimeExportsV0,
  morphRuntimeDefaultExportV0,
  resolveMorphRuntimeExportV0,
  type MorphRuntimeExportV0,
} from '../runtime/export-manifest'
import {
  resolveMorphRuntimePlayerContractV0,
  type MorphRuntimePlayerContractStatusV0,
} from './runtime-player-contract'

export const MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_SCHEMA_V0 = 'morph-runtime-public-player-contract/v0' as const
export const MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_VERSION_V0 = 0 as const

export type MorphRuntimePublicPlayerCacheProbeV0 = {
  label: string
  state?: string
  progress: number
  meaning: string
}

export type MorphRuntimePublicPlayerCacheReadoutV0 = MorphRuntimePublicPlayerCacheProbeV0 & {
  source: MorphRuntimeFieldCacheSourceV0
  sourceLabel: string
  layers: number
  cachedProgresses: number[]
}

export type MorphRuntimePublicPlayerContractV0 = {
  schema: typeof MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_SCHEMA_V0
  version: typeof MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_VERSION_V0
  storageKey: string
  artifactPath: string
  sceneId: string
  title?: string
  status: 'ready' | 'unsupported'
  player: MorphRuntimePlayerContractStatusV0
  byteLength: number
  generatedIds: string[]
  requiredCapabilities: string[]
  optionalCapabilities: string[]
  controllers: string[]
  boilMode?: string
  fieldCacheLayerCount: number
  cachedProgresses: number[]
  cacheReadout: MorphRuntimePublicPlayerCacheReadoutV0[]
}

export type MorphRuntimePublicPlayerV0 = {
  runtimeExport: MorphRuntimeExportV0
  contract: MorphRuntimePublicPlayerContractV0
}

export const MORPH_RUNTIME_PUBLIC_PLAYER_CACHE_PROBES_V0 = [
  {
    label: 'rest',
    progress: 0,
    meaning: 'compiled baseline',
  },
  {
    label: 'mid hover',
    state: 'hover',
    progress: 0.5,
    meaning: 'sample frame',
  },
  {
    label: 'hover',
    state: 'hover',
    progress: 1,
    meaning: 'target frame',
  },
  {
    label: 'uncached',
    state: 'hover',
    progress: 0.33,
    meaning: 'live fallback check',
  },
] as const satisfies readonly MorphRuntimePublicPlayerCacheProbeV0[]

export function resolveMorphRuntimePublicPlayerContractV0(
  runtimeExport: MorphRuntimeExportV0,
  probes: readonly MorphRuntimePublicPlayerCacheProbeV0[] = MORPH_RUNTIME_PUBLIC_PLAYER_CACHE_PROBES_V0,
): MorphRuntimePublicPlayerContractV0 {
  const player = resolveMorphRuntimePlayerContractV0(runtimeExport.document)
  const summary = runtimeExport.summary

  return {
    schema: MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_SCHEMA_V0,
    version: MORPH_RUNTIME_PUBLIC_PLAYER_CONTRACT_VERSION_V0,
    storageKey: runtimeExport.entry.storageKey,
    artifactPath: runtimeExport.entry.path,
    sceneId: runtimeExport.entry.sceneId,
    title: runtimeExport.entry.title,
    status: player.supported ? 'ready' : 'unsupported',
    player,
    byteLength: runtimeExport.artifactBytes,
    generatedIds: summary.generatedIds,
    requiredCapabilities: summary.requiredCapabilities,
    optionalCapabilities: summary.optionalCapabilities,
    controllers: summary.controllers,
    boilMode: summary.boilMode,
    fieldCacheLayerCount: summary.fieldCacheLayerCount,
    cachedProgresses: summary.cachedProgresses,
    cacheReadout: probes.map((probe) => {
      const status = morphRuntimeFieldCacheStatusV0(runtimeExport.document, {
        state: probe.state,
        progress: probe.progress,
      })

      return {
        ...probe,
        source: status.source,
        sourceLabel: morphRuntimeFieldCacheSourceLabelV0(status.source),
        layers: status.matchingLayers,
        cachedProgresses: status.cachedProgresses,
      }
    }),
  }
}

export function resolveMorphRuntimePublicPlayerV0(storageKey: string): MorphRuntimePublicPlayerV0 | null {
  const runtimeExport = resolveMorphRuntimeExportV0(storageKey)
  if (!runtimeExport) return null

  return {
    runtimeExport,
    contract: resolveMorphRuntimePublicPlayerContractV0(runtimeExport),
  }
}

export function listMorphRuntimePublicPlayersV0(): MorphRuntimePublicPlayerV0[] {
  return listMorphRuntimeExportsV0().map((runtimeExport) => ({
    runtimeExport,
    contract: resolveMorphRuntimePublicPlayerContractV0(runtimeExport),
  }))
}

export const morphRuntimeDefaultPublicPlayerV0: MorphRuntimePublicPlayerV0 = {
  runtimeExport: morphRuntimeDefaultExportV0,
  contract: resolveMorphRuntimePublicPlayerContractV0(morphRuntimeDefaultExportV0),
}
