import type { DrawableLayer, InnerShaderConfig, InnerShaderPassConfig, InnerShaderPassFieldInputs, InnerShaderPassRole, InnerShaderPipelinePass } from './types'

export type ResolvedDrawableShadePassV0 = {
  id: string
  role: InnerShaderPassRole
  lit: boolean
  seedOffset: number
  markBudget: number
  fieldInputs?: InnerShaderPassFieldInputs
  cacheKeyContribution: string
  pass: InnerShaderPassConfig
}

export type DrawableShadePassSourceV0 = {
  innerShadow?: InnerShaderPassConfig | null
  highlight?: InnerShaderPassConfig | null
}

function isPositiveFinite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function drawableShadePassMarkBudgetV0(pass: InnerShaderPassConfig): number {
  const populations = Math.max(1, pass.markSet?.length ?? 1)
  const density = Math.max(0.18, Math.min(1.8, pass.densityEdge ?? 0.72))
  const scale = Math.max(0.35, Math.min(2.5, pass.textureScale ?? 1))
  const coverage = Math.max(0.08, Math.min(1.2, pass.coverage ?? 0.72))
  const intensity = Math.max(0.08, Math.min(1.25, pass.intensity ?? 0.4))
  return Math.ceil((196 * populations * density * coverage * (0.72 + intensity * 0.48)) / scale)
}

function defaultSeedOffset(role: InnerShaderPassRole, index: number) {
  switch (role) {
    case 'core-shadow':
      return 9
    case 'rim-light':
      return 23
    case 'tone-zone':
      return 41
    case 'ambient-contour':
      return 59
    case 'contact-shadow':
      return 73
    case 'cast-shadow':
      return 89
    default:
      return 9 + index * 17
  }
}

function stripPipelinePass(pass: InnerShaderPipelinePass): InnerShaderPassConfig {
  const {
    id: _id,
    role: _role,
    lit: _lit,
    markBudget: _markBudget,
    seedOffset: _seedOffset,
    fieldInputs: _fieldInputs,
    cacheKeyContribution: _cacheKeyContribution,
    ...config
  } = pass
  return config
}

function resolveAuthoredPipelinePass(pass: InnerShaderPipelinePass, index: number): ResolvedDrawableShadePassV0 | null {
  if (!pass.id || !isPositiveFinite(pass.markBudget)) return null
  const config = stripPipelinePass(pass)
  const seedOffset = Number.isFinite(pass.seedOffset) ? pass.seedOffset! : defaultSeedOffset(pass.role, index)
  return {
    id: pass.id,
    role: pass.role,
    lit: pass.lit,
    seedOffset,
    markBudget: Math.ceil(pass.markBudget),
    ...(pass.fieldInputs ? { fieldInputs: pass.fieldInputs } : {}),
    cacheKeyContribution: pass.cacheKeyContribution ?? `${pass.role}:${pass.id}`,
    pass: config,
  }
}

function resolveLegacyPass(id: 'innerShadow' | 'highlight', role: InnerShaderPassRole, lit: boolean, seedOffset: number, pass: InnerShaderPassConfig): ResolvedDrawableShadePassV0 {
  const markBudget = drawableShadePassMarkBudgetV0(pass)
  return {
    id,
    role,
    lit,
    seedOffset,
    markBudget,
    cacheKeyContribution: `${role}:${id}`,
    pass,
  }
}

export function resolveDrawableShadePassPipelineV0(
  inner: InnerShaderConfig | undefined,
  passFlags: DrawableLayer['passes'] = {},
  resolvedLegacyPasses?: DrawableShadePassSourceV0,
): ResolvedDrawableShadePassV0[] {
  if (!inner) return []
  if (Array.isArray(inner.shadePasses)) {
    return inner.shadePasses
      .map((pass, index) => resolveAuthoredPipelinePass(pass, index))
      .filter((pass): pass is ResolvedDrawableShadePassV0 => !!pass)
  }

  const balanced = resolvedLegacyPasses ?? inner
  const pipeline: ResolvedDrawableShadePassV0[] = []
  if (passFlags.innerShadow !== false && balanced.innerShadow) {
    pipeline.push(resolveLegacyPass('innerShadow', 'core-shadow', false, 9, balanced.innerShadow))
  }
  if (passFlags.highlight !== false && balanced.highlight) {
    pipeline.push(resolveLegacyPass('highlight', 'rim-light', true, 23, balanced.highlight))
  }
  return pipeline
}
