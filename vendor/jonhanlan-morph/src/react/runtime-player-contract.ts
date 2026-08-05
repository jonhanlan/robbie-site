import type {
  MorphRuntimeCapabilityV0,
  MorphRuntimeDocumentV0,
  MorphRuntimeQualityHintV0,
  MorphRuntimeReducedMotionFallbackV0,
  MorphRuntimeRenderTierV0,
} from '../runtime'

export const MORPH_RUNTIME_PLAYER_SUPPORTED_RENDER_TIERS_V0 = ['svg', 'svg-cache'] as const
export const MORPH_RUNTIME_PLAYER_SUPPORTED_CAPABILITIES_V0 = [
  'svg',
  'state-motion',
] as const satisfies readonly MorphRuntimeCapabilityV0[]

const SUPPORTED_RENDER_TIERS = new Set<string>(MORPH_RUNTIME_PLAYER_SUPPORTED_RENDER_TIERS_V0)
const SUPPORTED_CAPABILITIES = new Set<string>(MORPH_RUNTIME_PLAYER_SUPPORTED_CAPABILITIES_V0)

export type MorphRuntimePlayerContractStatusV0 = {
  supported: boolean
  missingCapabilities: string[]
  renderTier: MorphRuntimeRenderTierV0
  quality: MorphRuntimeQualityHintV0
  reducedMotionFallback: MorphRuntimeReducedMotionFallbackV0
}

export function resolveMorphRuntimePlayerContractV0(document: MorphRuntimeDocumentV0): MorphRuntimePlayerContractStatusV0 {
  const renderTier = document.renderTier ?? 'svg'
  const missingCapabilities: string[] = (document.capabilities?.required ?? ['svg'])
    .filter((capability) => !SUPPORTED_CAPABILITIES.has(capability))

  if (!SUPPORTED_RENDER_TIERS.has(renderTier)) missingCapabilities.push(`renderTier:${renderTier}`)

  return {
    supported: missingCapabilities.length === 0,
    missingCapabilities,
    renderTier,
    quality: document.quality ?? 'high',
    reducedMotionFallback: document.fallbacks?.reducedMotion ?? 'freeze',
  }
}

export function morphRuntimePlayerShouldAnimateV0(document: MorphRuntimeDocumentV0, reducedMotion: boolean): boolean {
  if (!reducedMotion) return true
  return resolveMorphRuntimePlayerContractV0(document).reducedMotionFallback === 'none'
}

export function morphRuntimePlayerInteractiveEnabledV0(
  document: MorphRuntimeDocumentV0,
  reducedMotion: boolean,
  requestedInteractive: boolean,
): boolean {
  if (!requestedInteractive) return false
  const status = resolveMorphRuntimePlayerContractV0(document)
  if (!status.supported) return false
  return !reducedMotion || (status.reducedMotionFallback !== 'static' && status.reducedMotionFallback !== 'first-frame')
}

export function morphRuntimePlayerInitialProgressV0(
  document: MorphRuntimeDocumentV0,
  progress: number,
  reducedMotion: boolean,
): number {
  if (!reducedMotion) return progress
  const fallback = resolveMorphRuntimePlayerContractV0(document).reducedMotionFallback
  return fallback === 'static' || fallback === 'first-frame' ? 0 : progress
}
