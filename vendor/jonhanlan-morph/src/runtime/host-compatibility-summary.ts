import type { MorphRuntimeControllerV0, MorphRuntimeDocumentV0 } from '../drawable/runtime-contract'

export const MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0 = 'morph-runtime-host-compatibility/v0' as const
export const MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0 = 0 as const

export type MorphRuntimeHostInputV0 =
  | {
      kind: 'scroll-progress'
      controllerId: string
      source: 'section' | 'page' | 'element'
      startId?: string
      endId?: string
    }
  | {
      kind: 'viewport-trigger'
      controllerId: string
      trigger?: 'in-view' | 'scroll-past'
      rootMargin?: string
      thresholdPx?: number
    }
  | {
      kind: 'pointer-overlays'
      overlays: readonly ('hover' | 'click')[]
    }
  | {
      kind: 'pointer-trigger'
      controllerId: string
      controllerType: string
    }
  | {
      kind: 'focus-trigger'
      controllerId: string
      controllerType: string
    }
  | {
      kind: 'controller'
      controllerId: string
      controllerType: string
      channel?: string
      min?: number
      max?: number
      options?: string[]
      default?: boolean | number | string | { x: number; y: number }
    }

export type MorphRuntimeHostShadePipelinePassV0 = {
  layerId: string
  passId: string
  role: string
  style?: string
  lit: boolean
  markBudget: number
  cacheKeyContribution?: string
  fieldInputs?: {
    sourceLayerOffset?: number
    offsetX?: number
    offsetY?: number
  }
}

export type MorphRuntimeHostShadePipelineV0 = {
  layers: number
  passes: number
  roles: string[]
  styles: string[]
  markBudget: number
  interLayerPasses: number
  passDetails: MorphRuntimeHostShadePipelinePassV0[]
}

export type MorphRuntimeHostGeometryV0 = {
  layers: number
  kinds: string[]
  pointCount: number
  closedPointCount: number
  ribbonStrokeCount: number
  ribbonPointCount: number
  pressurePointCount: number
  minPressureWidth?: number
  maxPressureWidth?: number
  pressureWidthRange?: number
}

export type MorphRuntimeHostCompatibilitySummaryV0 = {
  schema: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0
  version: typeof MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0
  storageKey: string
  hostInputs: MorphRuntimeHostInputV0[]
  geometry: MorphRuntimeHostGeometryV0
  shadePipeline?: MorphRuntimeHostShadePipelineV0
  player: {
    packageEntry: '@jonhanlan/morph/react/MorphRuntimePlayer' | '@jonhanlan/morph/react/MorphRuntimeStateEnginePlayer'
    stateEngine: boolean
    reducedMotionFallback?: string
    staticFallback: boolean
  }
}

export type MorphRuntimeHostCompatibilitySummarySourceV0 = {
  storageKey: string
  reducedMotionFallback?: string
}

export function createMorphRuntimeHostCompatibilitySummaryForDocumentV0(
  document: MorphRuntimeDocumentV0,
  source: MorphRuntimeHostCompatibilitySummarySourceV0 = { storageKey: document.scene.id },
): MorphRuntimeHostCompatibilitySummaryV0 {
  const controllers = document.controllers ?? []
  const stateEngine = runtimeRequiresStateEnginePlayerV0(document)
  const geometry = geometrySummaryForDocument(document)
  const shadePipeline = shadePipelineForDocument(document)

  return {
    schema: MORPH_RUNTIME_HOST_COMPATIBILITY_SCHEMA_V0,
    version: MORPH_RUNTIME_HOST_COMPATIBILITY_VERSION_V0,
    storageKey: source.storageKey,
    hostInputs: controllers.map(hostInputForController),
    geometry,
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

export function geometrySummaryForDocument(document: MorphRuntimeDocumentV0): MorphRuntimeHostGeometryV0 {
  const kinds: string[] = []
  let pointCount = 0
  let closedPointCount = 0
  let ribbonStrokeCount = 0
  let ribbonPointCount = 0
  const pressureWidths: number[] = []

  for (const layer of document.scene.layers) {
    const geometry = layer.geometry
    kinds.push(geometry.kind)
    if (geometry.kind === 'closed' || geometry.kind === 'open') {
      pointCount += geometry.points.length
      if (geometry.kind === 'closed') closedPointCount += geometry.points.length
      continue
    }
    if (geometry.kind === 'multi') {
      const multiPoints = geometry.groups.reduce((sum, group) => sum + group.length, 0)
      pointCount += multiPoints
      closedPointCount += multiPoints
      continue
    }
    const strokes = geometry.strokes ?? []
    ribbonStrokeCount += strokes.length
    for (const stroke of strokes) {
      pointCount += stroke.length
      ribbonPointCount += stroke.length
      for (const point of stroke) {
        if (Number.isFinite(point.w)) pressureWidths.push(point.w as number)
      }
    }
  }

  const minPressureWidth = pressureWidths.length ? round3(Math.min(...pressureWidths)) : undefined
  const maxPressureWidth = pressureWidths.length ? round3(Math.max(...pressureWidths)) : undefined

  return {
    layers: document.scene.layers.length,
    kinds: uniqueSorted(kinds),
    pointCount,
    closedPointCount,
    ribbonStrokeCount,
    ribbonPointCount,
    pressurePointCount: pressureWidths.length,
    ...(minPressureWidth !== undefined ? { minPressureWidth } : {}),
    ...(maxPressureWidth !== undefined ? { maxPressureWidth } : {}),
    ...(minPressureWidth !== undefined && maxPressureWidth !== undefined ? { pressureWidthRange: round3(maxPressureWidth - minPressureWidth) } : {}),
  }
}

export function runtimeRequiresStateEnginePlayerV0(document: MorphRuntimeDocumentV0): boolean {
  return !!(
    (document.controllers?.length ?? 0) > 0 ||
    document.scene.scrub ||
    document.scene.composition ||
    (document.scene.transitions?.length ?? 0) > 0 ||
    (document.scene.motion?.length ?? 0) > 0 ||
    (document.scene.stateGraph?.transitions?.length ?? 0) > 0 ||
    Object.keys(document.scene.states ?? {}).length > 1
  )
}

export function hostInputForController(controller: MorphRuntimeControllerV0): MorphRuntimeHostInputV0 {
  if (controller.channel === 'pointer' && controller.type === 'trigger') {
    return {
      kind: 'pointer-trigger',
      controllerId: controller.id,
      controllerType: controller.type,
    }
  }

  if (controller.channel === 'focus' && controller.type === 'trigger') {
    return {
      kind: 'focus-trigger',
      controllerId: controller.id,
      controllerType: controller.type,
    }
  }

  if (controller.channel === 'viewport' && controller.type === 'trigger') {
    return {
      kind: 'viewport-trigger',
      controllerId: controller.id,
    }
  }

  return {
    kind: 'controller',
    controllerId: controller.id,
    controllerType: controller.type,
    ...(controller.channel ? { channel: controller.channel } : {}),
    ...(controller.min !== undefined ? { min: controller.min } : {}),
    ...(controller.max !== undefined ? { max: controller.max } : {}),
    ...(controller.options ? { options: controller.options } : {}),
    ...(controller.default !== undefined ? { default: controller.default } : {}),
  }
}

export function shadePipelineForDocument(document: MorphRuntimeDocumentV0): MorphRuntimeHostShadePipelineV0 | null {
  const passDetails = document.scene.layers.flatMap((layer): MorphRuntimeHostShadePipelinePassV0[] => (
    (layer.inner?.shadePasses ?? []).map((pass) => ({
      layerId: layer.id,
      passId: pass.id,
      role: pass.role,
      ...(pass.style ? { style: pass.style } : {}),
      lit: pass.lit,
      markBudget: pass.markBudget,
      ...(pass.cacheKeyContribution ? { cacheKeyContribution: pass.cacheKeyContribution } : {}),
      ...(pass.fieldInputs ? { fieldInputs: pass.fieldInputs } : {}),
    }))
  ))

  if (!passDetails.length) return null

  return {
    layers: new Set(passDetails.map((pass) => pass.layerId)).size,
    passes: passDetails.length,
    roles: uniqueSorted(passDetails.map((pass) => pass.role)),
    styles: uniqueSorted(passDetails.flatMap((pass) => (pass.style ? [pass.style] : []))),
    markBudget: passDetails.reduce((sum, pass) => sum + pass.markBudget, 0),
    interLayerPasses: passDetails.filter((pass) => pass.fieldInputs?.sourceLayerOffset).length,
    passDetails,
  }
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort()
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000
}
