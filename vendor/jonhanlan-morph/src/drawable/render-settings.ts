import renderSettingsManifest from '../../exports/settings/render-settings-v0.json'

export const MORPH_RUNTIME_RENDER_SETTINGS_SCHEMA_V0 = 'morph-runtime-render-settings/v0' as const
export const MORPH_RUNTIME_DEFAULT_BOIL_MODE_V0 = 'active-only' as const
export const MORPH_RUNTIME_DEFAULT_REDUCED_MOTION_FALLBACK_V0 = 'first-frame' as const
export const MORPH_RUNTIME_BOIL_MODES_V0 = ['active-only', 'always', 'off'] as const
export const MORPH_RUNTIME_REDUCED_MOTION_SETTING_OPTIONS_V0 = ['first-frame', 'freeze', 'static', 'none'] as const

export type MorphRuntimeRenderSettingTypeV0 = 'select' | 'number'
export type MorphRuntimeRenderSettingGroupV0 = 'motion' | 'render' | 'shader'
export type MorphRuntimeRenderSettingApplicabilityV0 =
  | 'signature-source-owned'
  | 'inapplicable'
  | 'blocked-no-compiler-consumption'
export type MorphRuntimeRenderSettingDescriptorV0 = {
  id: string
  group: MorphRuntimeRenderSettingGroupV0
  label: string
  target: string
  type: MorphRuntimeRenderSettingTypeV0
  default: string | number
  options?: string[]
  min?: number
  max?: number
  step?: number
  capabilities: string[]
}

export type MorphRuntimeRenderSettingsManifestV0 = {
  schema: typeof MORPH_RUNTIME_RENDER_SETTINGS_SCHEMA_V0
  version: 0
  description: string
  datasetApplicability: {
    signature: {
      effectiveDescriptorCount: number
      statuses: Record<MorphRuntimeRenderSettingApplicabilityV0, string[]>
    }
  }
  defaults: {
    runtime: {
      boil: typeof MORPH_RUNTIME_DEFAULT_BOIL_MODE_V0
      reducedMotion: typeof MORPH_RUNTIME_DEFAULT_REDUCED_MOTION_FALLBACK_V0
    }
    motion: {
      fps: number
    }
    layer: {
      resolution: number
      smoothing: number
    }
    edge: Record<string, number>
    shade: Record<string, number>
  }
  groups: Array<{
    id: MorphRuntimeRenderSettingGroupV0
    label: string
    structure: 'Motion' | 'Render'
  }>
  descriptors: MorphRuntimeRenderSettingDescriptorV0[]
}

export const morphRuntimeRenderSettingsManifestV0 =
  renderSettingsManifest as MorphRuntimeRenderSettingsManifestV0

export function listMorphRuntimeRenderSettingDescriptorsV0(): MorphRuntimeRenderSettingDescriptorV0[] {
  return clonePlain(morphRuntimeRenderSettingsManifestV0.descriptors)
}

export function morphRuntimeRenderSettingDescriptorByIdV0(id: string): MorphRuntimeRenderSettingDescriptorV0 | null {
  return clonePlain(morphRuntimeRenderSettingsManifestV0.descriptors.find((descriptor) => descriptor.id === id) ?? null)
}

export function morphRuntimeRenderSettingDefaultsV0() {
  return clonePlain(morphRuntimeRenderSettingsManifestV0.defaults)
}

export function morphRuntimeSignatureRenderSettingApplicabilityV0() {
  return clonePlain(morphRuntimeRenderSettingsManifestV0.datasetApplicability.signature)
}

export function normalizeMorphRuntimeBoilModeV0(value: unknown): typeof MORPH_RUNTIME_BOIL_MODES_V0[number] {
  return typeof value === 'string' && (MORPH_RUNTIME_BOIL_MODES_V0 as readonly string[]).includes(value)
    ? value as typeof MORPH_RUNTIME_BOIL_MODES_V0[number]
    : MORPH_RUNTIME_DEFAULT_BOIL_MODE_V0
}

export function normalizeMorphRuntimeReducedMotionSettingV0(value: unknown): typeof MORPH_RUNTIME_REDUCED_MOTION_SETTING_OPTIONS_V0[number] {
  return typeof value === 'string' && (MORPH_RUNTIME_REDUCED_MOTION_SETTING_OPTIONS_V0 as readonly string[]).includes(value)
    ? value as typeof MORPH_RUNTIME_REDUCED_MOTION_SETTING_OPTIONS_V0[number]
    : MORPH_RUNTIME_DEFAULT_REDUCED_MOTION_FALLBACK_V0
}

function clonePlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}
