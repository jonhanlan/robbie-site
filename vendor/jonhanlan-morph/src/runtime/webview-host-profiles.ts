import { listMorphRuntimeExportsV0, type MorphRuntimeExportV0 } from './export-manifest'

export const MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_SCHEMA_V0 = 'morph-runtime-webview-host-profiles/v0' as const
export const MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_VERSION_V0 = 0 as const

export type MorphRuntimeWebviewHostProfileInputV0 =
  | 'pointer'
  | 'scroll-progress'
  | 'viewport-trigger'
  | 'gesture-overlay'
  | 'reduced-motion'

export type MorphRuntimeWebviewHostProfileV0 = {
  id: string
  title: string
  surface: 'browser-webview' | 'compact-webview' | 'cep-panel'
  playerEntry: '@jonhanlan/morph/runtime/webview-player'
  requiredRuntimeEntries: readonly string[]
  forbiddenImportFamilies: readonly ('react' | 'lab' | 'node')[]
  inputs: readonly MorphRuntimeWebviewHostProfileInputV0[]
  sampleStorageKeys: readonly string[]
  viewport: {
    width: number
    height: number
  }
  fallback: 'static-svg'
}

export type MorphRuntimeWebviewHostProfileManifestV0 = {
  schema: typeof MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_SCHEMA_V0
  version: typeof MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_VERSION_V0
  profiles: readonly MorphRuntimeWebviewHostProfileV0[]
}

export type MorphRuntimeWebviewHostProfileValidationV0 = {
  ok: boolean
  profiles: number
  runtimeEntries: number
  failures: string[]
}

const commonRuntimeEntries = [
  '@jonhanlan/morph/runtime',
  '@jonhanlan/morph/runtime/webview-player',
  '@jonhanlan/morph/runtime/host-adapters',
  '@jonhanlan/morph/runtime/host-compatibility',
] as const

const commonForbiddenImportFamilies = ['react', 'lab', 'node'] as const

export const morphRuntimeWebviewHostProfileManifestV0 = {
  schema: MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_SCHEMA_V0,
  version: MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_VERSION_V0,
  profiles: [
    {
      id: 'browser-webview',
      title: 'Browser WebView host',
      surface: 'browser-webview',
      playerEntry: '@jonhanlan/morph/runtime/webview-player',
      requiredRuntimeEntries: [
        ...commonRuntimeEntries,
        '@jonhanlan/morph/runtime/scroll-demo',
      ],
      forbiddenImportFamilies: commonForbiddenImportFamilies,
      inputs: ['pointer', 'scroll-progress', 'viewport-trigger', 'gesture-overlay', 'reduced-motion'],
      sampleStorageKeys: ['signature', 'scroll-demo-hero', 'scroll-demo-combined', 'scroll-demo-cue-in-view'],
      viewport: { width: 960, height: 720 },
      fallback: 'static-svg',
    },
    {
      id: 'loopbar-compact-webview',
      title: 'Loopbar compact WebView host',
      surface: 'compact-webview',
      playerEntry: '@jonhanlan/morph/runtime/webview-player',
      requiredRuntimeEntries: commonRuntimeEntries,
      forbiddenImportFamilies: commonForbiddenImportFamilies,
      inputs: ['pointer', 'reduced-motion'],
      sampleStorageKeys: ['signature', 'flower-ornament', 'mark-set-ornament'],
      viewport: { width: 320, height: 180 },
      fallback: 'static-svg',
    },
    {
      id: 'cep-panel-webview',
      title: 'CEP panel WebView host',
      surface: 'cep-panel',
      playerEntry: '@jonhanlan/morph/runtime/webview-player',
      requiredRuntimeEntries: [
        ...commonRuntimeEntries,
        '@jonhanlan/morph/runtime/scroll-demo',
      ],
      forbiddenImportFamilies: commonForbiddenImportFamilies,
      inputs: ['pointer', 'scroll-progress', 'viewport-trigger', 'gesture-overlay', 'reduced-motion'],
      sampleStorageKeys: ['signature', 'scroll-demo-page', 'scroll-demo-scroll-past', 'profile-mask'],
      viewport: { width: 420, height: 520 },
      fallback: 'static-svg',
    },
  ],
} as const satisfies MorphRuntimeWebviewHostProfileManifestV0

export function listMorphRuntimeWebviewHostProfilesV0(): MorphRuntimeWebviewHostProfileV0[] {
  return [...morphRuntimeWebviewHostProfileManifestV0.profiles].sort((left, right) => left.id.localeCompare(right.id))
}

export function resolveMorphRuntimeWebviewHostProfileV0(id: string): MorphRuntimeWebviewHostProfileV0 | null {
  return morphRuntimeWebviewHostProfileManifestV0.profiles.find((profile) => profile.id === id) ?? null
}

export function listMorphRuntimeWebviewHostProfilesForStorageKeyV0(storageKey: string): MorphRuntimeWebviewHostProfileV0[] {
  return listMorphRuntimeWebviewHostProfilesV0()
    .filter((profile) => profile.sampleStorageKeys.includes(storageKey))
}

export function validateMorphRuntimeWebviewHostProfileManifestV0(
  runtimeExports: readonly MorphRuntimeExportV0[] = listMorphRuntimeExportsV0(),
  manifest: MorphRuntimeWebviewHostProfileManifestV0 = morphRuntimeWebviewHostProfileManifestV0,
): MorphRuntimeWebviewHostProfileValidationV0 {
  const failures: string[] = []
  const runtimeKeys = new Set(runtimeExports.map((runtimeExport) => runtimeExport.entry.storageKey))
  const ids = new Set<string>()

  if (manifest.schema !== MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_SCHEMA_V0) {
    failures.push(`manifest schema expected ${MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_SCHEMA_V0} but found ${manifest.schema}`)
  }
  if (manifest.version !== MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_VERSION_V0) {
    failures.push(`manifest version expected ${MORPH_RUNTIME_WEBVIEW_HOST_PROFILE_MANIFEST_VERSION_V0} but found ${manifest.version}`)
  }
  if (manifest.profiles.length < 1) failures.push('manifest must include at least one host profile')

  for (const profile of manifest.profiles) {
    if (ids.has(profile.id)) failures.push(`duplicate host profile id ${profile.id}`)
    ids.add(profile.id)
    if (profile.playerEntry !== '@jonhanlan/morph/runtime/webview-player') {
      failures.push(`${profile.id} must consume @jonhanlan/morph/runtime/webview-player`)
    }
    if (!profile.requiredRuntimeEntries.includes('@jonhanlan/morph/runtime/webview-player')) {
      failures.push(`${profile.id} required runtime entries must include runtime/webview-player`)
    }
    for (const forbidden of commonForbiddenImportFamilies) {
      if (!profile.forbiddenImportFamilies.includes(forbidden)) failures.push(`${profile.id} must forbid ${forbidden} imports`)
    }
    if (profile.viewport.width < 120 || profile.viewport.height < 120) {
      failures.push(`${profile.id} viewport must be large enough to render a proof frame`)
    }
    for (const storageKey of profile.sampleStorageKeys) {
      if (!runtimeKeys.has(storageKey)) failures.push(`${profile.id} sample ${storageKey} is missing from runtime exports`)
    }
    if (profile.surface !== 'compact-webview' && !profile.inputs.includes('scroll-progress')) {
      failures.push(`${profile.id} must name scroll-progress support`)
    }
  }

  return {
    ok: failures.length === 0,
    profiles: manifest.profiles.length,
    runtimeEntries: runtimeExports.length,
    failures,
  }
}
